import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

// ─── Helper Components ───────────────────────────────────────────────────────

function ColorSwatch({ color, size = 40 }) {
  return (
    <div
      title={color}
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        background: color,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
        flexShrink: 0,
      }}
    />
  );
}

function SwatchRow({ label, colors }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
        {label}
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {colors?.map((c, i) => <ColorSwatch key={i} color={c} size={42} />)}
      </div>
    </div>
  );
}

function ContrastScale({ value }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 28,
              borderRadius: 3,
              background: `hsl(0, 0%, ${100 - i * 10}%)`,
              border: i + 1 === Math.round(value) ? '2px solid var(--gold)' : '1px solid rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 600,
              color: i < 4 ? '#333' : '#eee',
              transition: 'transform 0.2s',
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

function PaletteGrid({ colors, title, metals }) {
  const cols = 6;
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 4,
          marginBottom: 12,
        }}
      >
        {colors?.map((c, i) => (
          <div
            key={i}
            style={{
              aspectRatio: '1',
              background: c,
              borderRadius: 3,
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
            }}
          />
        ))}
        {/* Metals */}
        {metals && (metals === 'серебро' || metals === 'оба') && (
          <div
            style={{
              aspectRatio: '1',
              background: 'linear-gradient(135deg, #e8e8e8, #c0c0c0, #e8e8e8)',
              borderRadius: 3,
              position: 'relative',
            }}
          >
            <span style={{ position: 'absolute', bottom: 2, right: 3, fontSize: 8, color: '#666', fontFamily: 'var(--font-body)' }}>серебро</span>
          </div>
        )}
        {metals && (metals === 'золото' || metals === 'оба') && (
          <div
            style={{
              aspectRatio: '1',
              background: 'linear-gradient(135deg, #f5d98b, #c4953a, #f5d98b)',
              borderRadius: 3,
              position: 'relative',
            }}
          >
            <span style={{ position: 'absolute', bottom: 2, right: 3, fontSize: 8, color: '#5c3d00', fontFamily: 'var(--font-body)' }}>золото</span>
          </div>
        )}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-body)', letterSpacing: '0.06em' }}>
        {title} — тёмный и {metals === 'золото' ? 'тёплый' : metals === 'серебро' ? 'холодный' : 'смешанный'} колорит
      </div>
    </div>
  );
}

// ─── Photo Instructions ───────────────────────────────────────────────────────

function PhotoInstructions() {
  const tips = [
    { icon: '☀️', text: 'Снимайте при дневном свете, без прямых солнечных лучей — идеально у окна' },
    { icon: '🚫', text: 'Без фильтров и обработки — нам нужны ваши настоящие цвета' },
    { icon: '👤', text: 'Только вы на фото, крупный план лица — шея и плечи тоже в кадре' },
    { icon: '👓', text: 'Снимите очки и уберите волосы от лица, если возможно' },
    { icon: '📐', text: 'Смотрите прямо в камеру, лицо анфас, ровное освещение' },
    { icon: '📷', text: 'Лучше фото с телефона в хорошем освещении, чем профессиональное со вспышкой' },
  ];

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--light-border)',
        borderRadius: 16,
        padding: '28px 32px',
        marginBottom: 32,
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 500,
          marginBottom: 20,
          color: 'var(--espresso)',
        }}
      >
        Как правильно сфотографироваться
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {tips.map((tip, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: '12px 14px',
              background: '#FAF7F2',
              borderRadius: 10,
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>{tip.icon}</span>
            <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--espresso)', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
              {tip.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ onImageSelect, previewUrl }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => onImageSelect(e.target.result);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--gold)' : 'rgba(26,18,9,0.2)'}`,
        borderRadius: 16,
        padding: 48,
        textAlign: 'center',
        cursor: 'pointer',
        background: dragging ? 'rgba(196,149,58,0.04)' : 'white',
        transition: 'all 0.2s',
        minHeight: 240,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {previewUrl ? (
        <>
          <img
            src={previewUrl}
            alt="Preview"
            style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 12, objectFit: 'cover', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
          />
          <p style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>
            Нажмите, чтобы выбрать другое фото
          </p>
        </>
      ) : (
        <>
          <div style={{ fontSize: 48 }}>🖼</div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, marginBottom: 6 }}>
              Загрузите ваше фото
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
              Перетащите сюда или нажмите для выбора · JPG, PNG, WEBP
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen({ name }) {
  const steps = [
    'Анализирую тон кожи...',
    'Изучаю рисунок радужки...',
    'Определяю контрастность...',
    'Подбираю цветотип...',
    'Формирую палитру...',
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        padding: 48,
      }}
    >
      {/* Spinner */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '3px solid var(--light-border)',
            borderTopColor: 'var(--gold)',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, marginBottom: 12 }}>
          {name ? `${name}, анализирую вашу внешность` : 'Анализирую внешность'}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            color: 'var(--gold)',
            fontWeight: 400,
            minHeight: 24,
            transition: 'opacity 0.3s',
          }}
        >
          {steps[step]}
        </p>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
        Это займёт около 15–30 секунд
      </p>
    </div>
  );
}

// ─── Error Screen ─────────────────────────────────────────────────────────────

function ErrorScreen({ error, onRetry }) {
  return (
    <div
      style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: 48,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 24 }}>📸</div>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          fontWeight: 500,
          marginBottom: 16,
          color: 'var(--espresso)',
        }}
      >
        {error.error_title || 'Алло, подождите!'}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 16,
          lineHeight: 1.7,
          color: 'var(--espresso)',
          fontWeight: 300,
          marginBottom: 32,
        }}
      >
        {error.error_message}
      </p>

      {error.error_tips && error.error_tips.length > 0 && (
        <div
          style={{
            background: '#FFF8F0',
            border: '1px solid rgba(196,149,58,0.3)',
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
            textAlign: 'left',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: 12,
            }}
          >
            Как исправить
          </p>
          {error.error_tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--gold)', fontWeight: 600, flexShrink: 0 }}>→</span>
              <p style={{ fontSize: 14, lineHeight: 1.5, fontFamily: 'var(--font-body)', fontWeight: 300 }}>{tip}</p>
            </div>
          ))}
        </div>
      )}

      <button onClick={onRetry} style={btnStyle}>
        Попробовать снова
      </button>
    </div>
  );
}

// ─── Results / Presentation ───────────────────────────────────────────────────

function ResultsPresentation({ data, name, imageUrl, onReset }) {
  const hasTwo = data.color_type_2 != null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 80px' }}>
      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          padding: '48px 0 40px',
          borderBottom: '1px solid var(--light-border)',
          marginBottom: 48,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: 12,
          }}
        >
          Персональный анализ цветотипа
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 6vw, 60px)',
            fontWeight: 300,
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          {name ? `${name},` : ''} определяем
          <br />
          <em>твой цветотип</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', fontWeight: 300 }}>
          Работу выполнила персональный стилист{' '}
          <a
            href="https://www.linkedin.com/in/irina-tolpegina-99a11267/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--espresso)', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid var(--gold)' }}
          >
            Ирина Толпегина
          </a>
        </p>
      </div>

      {/* Section 1: Portrait Analysis */}
      <section style={{ marginBottom: 56 }}>
        <SectionTitle number="01" title="Анализ цветов портретной зоны" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 40,
            alignItems: 'start',
          }}
        >
          <img
            src={imageUrl}
            alt={name || 'Portrait'}
            style={{
              width: 200,
              height: 240,
              objectFit: 'cover',
              objectPosition: 'top',
              borderRadius: 12,
              boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
            }}
          />
          <div>
            <SwatchRow label="Кожа" colors={data.skin_colors} />
            <SwatchRow label="Глаза" colors={data.eye_colors} />
            <SwatchRow label="Брови" colors={data.eyebrow_colors} />
          </div>
        </div>
      </section>

      {/* Section 2: Contrast */}
      <section style={{ marginBottom: 56 }}>
        <SectionTitle number="02" title="Контраст" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <ContrastScale value={data.eye_darkness} />
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.hair_note && (
                <MetricRow label="Волосы" value={data.hair_note} />
              )}
              <MetricRow label="Брови" value={`${data.eyebrow_darkness}/10`} />
              <MetricRow label="Кожа" value={`${data.skin_lightness}/10`} />
              <MetricRow label="Глаза" value={`${data.eye_darkness}/10`} />
              <MetricRow
                label="Контраст"
                value={`${data.eye_darkness} – ${data.skin_lightness} = ${data.contrast}`}
                highlight
              />
            </div>
          </div>
          <div
            style={{
              background: 'white',
              border: '1px solid var(--light-border)',
              borderRadius: 12,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Уровень контраста
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500 }}>
              {data.contrast_level}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6 }}>
              Подтон кожи: <strong style={{ color: 'var(--espresso)', fontWeight: 500 }}>{data.skin_undertone}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Eyes */}
      <section style={{ marginBottom: 56 }}>
        <SectionTitle number="03" title="Глаза" />
        <div
          style={{
            background: 'white',
            border: '1px solid var(--light-border)',
            borderRadius: 12,
            padding: 28,
          }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.8, fontWeight: 300 }}>
            Рисунок радужной оболочки глаза —{' '}
            <strong style={{ fontWeight: 600, color: 'var(--gold)' }}>{data.eye_season_hint}</strong>
            {' '}({data.eye_pattern})
          </p>
        </div>
      </section>

      {/* Section 4: Summary */}
      <section style={{ marginBottom: 56 }}>
        <SectionTitle number="04" title="Саммари анализа" />
        <div
          style={{
            background: 'white',
            border: '1px solid var(--light-border)',
            borderRadius: 12,
            padding: 28,
          }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.9, fontWeight: 300 }}>
            {data.summary}
          </p>
          {data.dominant_characteristic && (
            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['тёмная', 'светлая', 'тёплая', 'холодная', 'яркая', 'мягкая'].map((char) => (
                <span
                  key={char}
                  style={{
                    padding: '4px 14px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    background: data.dominant_characteristic?.toLowerCase().includes(char)
                      ? 'var(--gold)'
                      : 'transparent',
                    color: data.dominant_characteristic?.toLowerCase().includes(char)
                      ? 'white'
                      : 'var(--muted)',
                    border: `1px solid ${data.dominant_characteristic?.toLowerCase().includes(char) ? 'var(--gold)' : 'var(--light-border)'}`,
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 5: Color Types */}
      <section style={{ marginBottom: 56 }}>
        <SectionTitle number="05" title={hasTwo ? 'Два подходящих варианта' : 'Ваш цветотип'} />

        {hasTwo && (
          <div
            style={{
              background: '#FFF8F0',
              border: '1px solid rgba(196,149,58,0.3)',
              borderRadius: 12,
              padding: 20,
              marginBottom: 28,
            }}
          >
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.7, fontWeight: 300 }}>
              Тебе подойдут <strong style={{ fontWeight: 600 }}>два цветотипа</strong>, поэтому можно выбрать ту палитру, которая тебе ближе интуитивно.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: hasTwo ? '1fr 1fr' : '1fr', gap: 24 }}>
          <ColorTypeCard
            number={hasTwo ? '1 вариант' : 'Ваш цветотип'}
            type={data.color_type_1}
            description={data.color_type_description_1}
            palette={data.palette_1}
            metals={data.metals_1}
          />
          {hasTwo && data.color_type_2 && (
            <ColorTypeCard
              number="2 вариант"
              type={data.color_type_2}
              description={data.color_type_description_2}
              palette={data.palette_2}
              metals={data.metals_2}
            />
          )}
        </div>
      </section>

      {/* Styling tip */}
      {data.styling_tip && (
        <div
          style={{
            textAlign: 'center',
            padding: '32px 40px',
            background: 'white',
            borderRadius: 16,
            border: '1px solid var(--light-border)',
            marginBottom: 48,
          }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
            Совет стилиста
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, fontStyle: 'italic', lineHeight: 1.6 }}>
            "{data.styling_tip}"
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', marginTop: 12 }}>— Ирина Толпегина</p>
        </div>
      )}

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <button onClick={onReset} style={{ ...btnStyle, marginRight: 12 }}>
          Анализировать другое фото
        </button>
        <a
          href="https://www.linkedin.com/in/irina-tolpegina-99a11267/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...btnStyle,
            display: 'inline-block',
            background: 'transparent',
            color: 'var(--espresso)',
            border: '1px solid var(--espresso)',
            textDecoration: 'none',
          }}
        >
          Связаться с Ирой
        </a>
      </div>
    </div>
  );
}

function SectionTitle({ number, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: 'var(--gold)',
          background: 'rgba(196,149,58,0.1)',
          padding: '4px 10px',
          borderRadius: 4,
        }}
      >
        {number}
      </span>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500 }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: 'var(--light-border)' }} />
    </div>
  );
}

function MetricRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--light-border)' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>{label}</span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: highlight ? 700 : 400,
          color: highlight ? 'var(--espresso)' : 'var(--espresso)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ColorTypeCard({ number, type, description, palette, metals }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--light-border)',
        borderRadius: 16,
        padding: 28,
      }}
    >
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
        {number}
      </p>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 500, marginBottom: 14 }}>{type}</h3>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.7, color: 'var(--muted)', fontWeight: 300, marginBottom: 20 }}>
        {description}
      </p>
      {palette && <PaletteGrid colors={palette} title={type} metals={metals} />}
    </div>
  );
}

// ─── Button style ─────────────────────────────────────────────────────────────

const btnStyle = {
  display: 'inline-block',
  padding: '14px 32px',
  background: 'var(--espresso)',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: '0.04em',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [name, setName] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [state, setState] = useState('upload'); // upload | loading | results | error
  const [result, setResult] = useState(null);
  const [errorData, setErrorData] = useState(null);

  const handleAnalyze = async () => {
    if (!imageDataUrl) return;
    setState('loading');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl, name: name.trim() }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      if (data.valid === false) {
        setErrorData(data);
        setState('error');
      } else {
        setResult(data);
        setState('results');
      }
    } catch (err) {
      setErrorData({
        error_title: 'Технический сбой',
        error_message: 'Что-то пошло не так на нашей стороне. Попробуйте ещё раз через минуту — Ира уже разбирается!',
        error_tips: [
          'Обновите страницу и попробуйте снова',
          'Убедитесь, что файл не превышает 10 МБ',
          'Попробуйте использовать другой браузер',
        ],
      });
      setState('error');
    }
  };

  const handleReset = () => {
    setState('upload');
    setImageDataUrl(null);
    setResult(null);
    setErrorData(null);
  };

  return (
    <>
      <Head>
        <title>Цветотип за минуту — Ирина Толпегина</title>
        <meta name="description" content="Персональный анализ цветотипа с помощью искусственного интеллекта. Загрузите фото — получите профессиональную консультацию." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      {/* Navigation */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
          borderBottom: '1px solid var(--light-border)',
          background: 'var(--cream)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, lineHeight: 1 }}>
            Ирина Толпегина
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--muted)', fontWeight: 300, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Стилист · Маркетолог
          </p>
        </div>
        <a
          href="https://www.linkedin.com/in/irina-tolpegina-99a11267/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--espresso)',
            textDecoration: 'none',
            borderBottom: '1px solid var(--gold)',
            paddingBottom: 2,
          }}
        >
          LinkedIn →
        </a>
      </nav>

      {/* Main Content */}
      {state === 'upload' && (
        <main style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px' }}>
          {/* Hero */}
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: 16,
              }}
            >
              AI-анализ цветотипа
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 7vw, 72px)',
                fontWeight: 300,
                lineHeight: 1.05,
                marginBottom: 20,
              }}
            >
              Узнай свой
              <br />
              <em>цветотип</em>
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 16,
                lineHeight: 1.8,
                color: 'var(--muted)',
                fontWeight: 300,
                maxWidth: 480,
                margin: '0 auto',
              }}
            >
              Загрузи портретное фото — и через 30 секунд ты получишь персональный анализ своей цветовой палитры от Иры Толпегиной.
            </p>
          </div>

          <PhotoInstructions />

          {/* Name input */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 8,
              }}
            >
              Как вас зовут?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              style={{
                width: '100%',
                padding: '14px 18px',
                fontFamily: 'var(--font-body)',
                fontSize: 16,
                fontWeight: 300,
                background: 'white',
                border: '1px solid var(--light-border)',
                borderRadius: 10,
                outline: 'none',
                color: 'var(--espresso)',
              }}
            />
          </div>

          <UploadZone onImageSelect={setImageDataUrl} previewUrl={imageDataUrl} />

          {imageDataUrl && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button
                onClick={handleAnalyze}
                style={{ ...btnStyle, padding: '16px 48px', fontSize: 15 }}
              >
                Определить цветотип →
              </button>
            </div>
          )}
        </main>
      )}

      {state === 'loading' && <LoadingScreen name={name} />}

      {state === 'error' && errorData && (
        <main style={{ padding: '40px 24px' }}>
          <ErrorScreen error={errorData} onRetry={handleReset} />
        </main>
      )}

      {state === 'results' && result && (
        <main style={{ padding: '0 24px' }}>
          <ResultsPresentation
            data={result}
            name={name}
            imageUrl={imageDataUrl}
            onReset={handleReset}
          />
        </main>
      )}

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--light-border)',
          padding: '32px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', fontWeight: 300 }}>
          © {new Date().getFullYear()} Ирина Толпегина — Персональный стилист и маркетолог
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--muted)', fontWeight: 300 }}>
          Powered by Claude AI
        </p>
      </footer>
    </>
  );
}
