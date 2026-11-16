/** 关键词跑马灯 / Decorative marquee band. */
const WORDS = [
  'FLUENT DESIGN',
  'SUN VALLEY',
  'LIQUID GLASS',
  'WEBP',
  'PWA',
  'PERFORMANCE',
  'MINECRAFT',
  'BILIBILI',
  'GPL-3.0',
];

export function Marquee() {
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <div className="marquee__group" key={copy}>
            {WORDS.map((word) => (
              <span className="marquee__item" key={`${copy}-${word}`}>
                {word}
                <span className="marquee__star">✳</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
