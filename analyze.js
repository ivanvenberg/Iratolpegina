import Anthropic from '@anthropic-ai/sdk';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Ты — профессиональный персональный стилист и колорист. Ты анализируешь портретные фотографии людей, чтобы определить их сезонный цветотип по методике цветового анализа.

Ты должен ответить ТОЛЬКО валидным JSON-объектом, без другого текста, markdown, пояснений.

Анализируй портретное фото и отвечай строго в этом формате:

{
  "valid": true,
  "skin_colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "eye_colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "eyebrow_colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "skin_lightness": <число от 1 до 10, где 1=очень светлая, 10=очень тёмная>,
  "eye_darkness": <число от 1 до 10>,
  "eyebrow_darkness": <число от 1 до 10>,
  "contrast": <разница между самым тёмным и самым светлым элементами>,
  "contrast_level": "низкая" | "средняя" | "высокая",
  "eye_pattern": "<описание рисунка радужки на русском — лучи, кольца, волокна, спицы колеса и т.д.>",
  "eye_season_hint": "<к какому сезону указывает рисунок глаз — Зима/Весна/Лето/Осень>",
  "skin_undertone": "тёплый" | "холодный" | "нейтральный",
  "hair_note": "<заметка о волосах на русском, если видны, или 'волосы не видны на фото'>",
  "summary": "<2-3 предложения на русском — краткое резюме анализа портретной зоны>",
  "dominant_characteristic": "<самая яркая характеристика внешности — тёмная/светлая/тёплая/холодная/яркая/мягкая>",
  "color_type_1": "<название цветотипа на русском — например: Тёмная осень, Тёмная зима, Светлая весна, Мягкое лето и т.д.>",
  "color_type_description_1": "<2-3 предложения описания первого варианта на русском>",
  "palette_1": ["#hex1", "#hex2", ... 18-24 hex-цвета палитры этого цветотипа],
  "metals_1": "серебро" | "золото" | "оба",
  "color_type_2": "<второй вариант если есть неоднозначность, иначе null>",
  "color_type_description_2": "<описание второго варианта на русском, или null>",
  "palette_2": ["#hex1", ... ] или null,
  "metals_2": "серебро" | "золото" | "оба" или null,
  "styling_tip": "<короткий совет по стилю на русском, 1 предложение>"
}

ВАЖНО — правила для "valid": false (невалидное фото):
- Лицо не видно или слишком маленькое
- Фото размытое, слишком тёмное или засвеченное
- На фото несколько людей
- Сильные фильтры или экстремальное освещение, искажающее цвета
- Солнцезащитные очки закрывают глаза
- Фото не портретное

Если фото невалидное, отвечай:
{
  "valid": false,
  "error_title": "<заголовок ошибки — дружелюбно>",
  "error_message": "<подробное объяснение на русском что не так и как исправить, в стиле дружелюбного стилиста — говори от лица Иры>",
  "error_tips": ["<совет 1>", "<совет 2>", "<совет 3>"]
}

Палитры для цветотипов (используй как базу, адаптируй под конкретного человека):
- Тёмная зима: глубокий черный, угольный серый, белый, ярко-синий, изумрудный, пурпурный, малиновый, бордо
- Тёмная осень: тёмно-коричневый, горчичный, терракота, хаки, бургунди, оливковый, ржавый, тёмно-бирюзовый  
- Яркая зима: чисто белый, черный, ярко-красный, электрик синий, кислотно-розовый, ярко-зелёный
- Яркая весна: коралловый, насыщенный оранжевый, яркий изумруд, золотисто-жёлтый
- Мягкое лето: припылённая роза, серо-голубой, лавандовый, серо-зелёный
- Мягкая осень: персиковый, тёплый бежевый, мягкий терракот, камельный`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, name } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
  const mediaTypeMatch = image.match(/^data:(image\/\w+);base64,/);
  const mediaType = mediaTypeMatch ? mediaTypeMatch[1] : 'image/jpeg';

  const validMediaTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const safeMediaType = validMediaTypes.includes(mediaType) ? mediaType : 'image/jpeg';

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: safeMediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: `Проанализируй это фото для определения цветотипа. Имя человека: ${name || 'не указано'}. Отвечай только JSON, никакого другого текста.`,
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].text.trim();
    
    // Clean potential JSON fences
    const cleaned = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw:', cleaned.substring(0, 200));
      return res.status(500).json({ error: 'Failed to parse analysis result' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Anthropic API error:', error);
    return res.status(500).json({ 
      error: 'Analysis service error', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
