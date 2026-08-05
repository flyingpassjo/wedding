import { useEffect, useState } from 'react'
import './App.css'

const BASE_PATH = import.meta.env.BASE_URL ?? '/'
const withBase = (path) => `${BASE_PATH}${String(path).replace(/^\/+/, '')}`

const galleryImages = [
  'Wedding2.jpeg',
  'Wedding3.jpeg',
  'Wedding7.jpeg',
  'Wedding8.jpeg',
  'Wedding9.jpeg',
  'Wedding10.jpeg',
  'Wedding14.jpeg',
  'Wedding15.png',
  'Wedding16.png',
  'Wedding17.png',
  'Wedding18.jpeg',
  'Wedding19.jpeg',
  'Wedding20.jpeg',
].map((fileName, index) => ({
  src: withBase(`images/gallery/${fileName}`),
  alt: `ウェディングギャラリー写真 ${index + 1}`,
}))

const timeline = [
  { time: '17:00', title: '受付・ウェルカムドリンク' },
  { time: '18:00', title: '挙式' },
  { time: '18:40', title: '挙式終了' },
  { time: '19:00', title: 'ウェディングパーティー' },
  { time: '21:00', title: '終了' },
]

const googleMapsUrl = 'https://maps.app.goo.gl/YCf63p2g4pbWAyBd7'

function SectionTitle({ kicker, title }) {
  return (
    <header className="invite-section-head">
      <p>{kicker}</p>
      <h3 className="section-title">{title}</h3>
    </header>
  )
}

export default function JapaneseInvitation() {
  const [selectedIndex, setSelectedIndex] = useState(null)

  useEffect(() => {
    if (selectedIndex == null) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedIndex(null)
      if (event.key === 'ArrowLeft') setSelectedIndex((index) => (index + galleryImages.length - 1) % galleryImages.length)
      if (event.key === 'ArrowRight') setSelectedIndex((index) => (index + 1) % galleryImages.length)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedIndex])

  const showPrevious = () => setSelectedIndex((index) => (index + galleryImages.length - 1) % galleryImages.length)
  const showNext = () => setSelectedIndex((index) => (index + 1) % galleryImages.length)

  return (
    <div className="app-shell screen-guest jp-invite">
      <main className="page-container guest-page">
        <section className="invite-cover">
          <img src={withBase('images/wedding-sub.jepg')} alt="ユン・ウォンテとチョ・ヨンソのウェディングフォト" className="invite-cover-image" />
          <div className="invite-cover-overlay" />
          <div className="invite-hero-top">
            <p className="invite-eyebrow">WEDDING INVITATION</p>
            <h1 className="invite-title">ユン・ウォンテ<br />&amp;<br />チョ・ヨンソ</h1>
            <p className="invite-date">2026年10月17日（土）18:00</p>
            <p className="invite-venue">ルモスガーデン<br />韓国・釜山（プサン）／機張（キジャン）</p>
          </div>
          <div className="invite-hero-bottom">
            <p className="invite-hero-message">皆さまを心よりご招待申し上げます</p>
            <div className="invite-cover-greeting">
              <p>このたび、私たちは結婚式を挙げる運びとなりました。</p>
              <p>ご多用のところ誠に恐縮ではございますが、私たちの新たな門出にお立ち会いいただけましたら幸いに存じます。</p>
            </div>
          </div>
        </section>

        <section className="card invite-card">
          <SectionTitle kicker="WEDDING DAY" title="結婚式のご案内" />
          <dl className="essential-list">
            <div>
              <dt>日時</dt>
              <dd>2026年10月17日（土）18:00</dd>
            </div>
            <div>
              <dt>会場</dt>
              <dd>ルモスガーデン（루모스가든 / Lumos Garden）</dd>
            </div>
            <div>
              <dt>住所</dt>
              <dd>韓国・釜山広域市 機張郡 機張邑 機張海岸路 377</dd>
            </div>
          </dl>
          <a className="btn btn-line jp-map-link" href={googleMapsUrl} target="_blank" rel="noreferrer">Google マップで場所を見る</a>
        </section>

        <section className="card invite-card jp-information-card">
          <SectionTitle kicker="INFORMATION" title="ご案内" />
          <ul className="notice-list jp-information-list">
            <li>会場は韓国・釜山（プサン）広域市の機張（キジャン）郡にございます。</li>
            <li>宿泊施設および移動手段は、すべてこちらで手配いたしますので、どうぞご安心ください。</li>
            <li className="jp-response-note">ご出欠につきましては、誠に恐れ入りますが、このLINEのトークにてご返信くださいますようお願い申し上げます。</li>
          </ul>
        </section>

        <section className="card invite-card">
          <SectionTitle kicker="SCHEDULE" title="当日のスケジュール" />
          <ul className="timeline-list">
            {timeline.map((item) => (
              <li key={item.time}>
                <span>{item.time}</span>
                <div className="timeline-copy"><strong>{item.title}</strong></div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card invite-card">
          <SectionTitle kicker="GALLERY" title="ギャラリー" />
          <div className="gallery-grid">
            {galleryImages.map((image, index) => (
              <button key={image.src} type="button" className="gallery-card" onClick={() => setSelectedIndex(index)} aria-label={`写真 ${index + 1} を拡大表示`}>
                <img src={image.src} alt={image.alt} loading="lazy" />
              </button>
            ))}
          </div>
        </section>
      </main>

      {selectedIndex != null ? (
        <div className="gallery-modal-backdrop" onClick={() => setSelectedIndex(null)} role="dialog" aria-modal="true" aria-label="ギャラリー写真の拡大表示">
          <section className="gallery-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="gallery-modal-close" onClick={() => setSelectedIndex(null)} aria-label="ギャラリーを閉じる">閉じる</button>
            <button type="button" className="gallery-modal-arrow prev" onClick={showPrevious} aria-label="前の写真">‹</button>
            <figure className="gallery-modal-figure">
              <img src={galleryImages[selectedIndex].src} alt={galleryImages[selectedIndex].alt} />
              <figcaption>{selectedIndex + 1} / {galleryImages.length}</figcaption>
            </figure>
            <button type="button" className="gallery-modal-arrow next" onClick={showNext} aria-label="次の写真">›</button>
          </section>
        </div>
      ) : null}
    </div>
  )
}
