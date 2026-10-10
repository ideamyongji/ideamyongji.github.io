import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Ambient, Footer, Nav } from '../components/Chrome'
import { NextPage } from '../components/NextPage'
import { SubHero } from '../components/SubHero'
import { ease } from '../content'
import { LINKS } from '../links'
import { IMAGE_EXT_RE, abs, displayName, instagramPermalink, sizeOf, useData, type GalleryItem, type InstagramPost, type Load, type Notice } from '../newsData'

// Posts are read live from the original site's data files, which admin.html (on the original site)
// edits through the GitHub API — so the existing posting workflow keeps working unchanged.
// Static copy (headings, empty/error messages) is verbatim from the original news.html.

const TAB_IDS = ['notice', 'instagram', 'gallery'] as const
type TabId = (typeof TAB_IDS)[number]
const readHashTab = (): TabId => {
  const h = window.location.hash.slice(1)
  if (h === 'archive') return 'instagram' // 자료실(#archive) 자리를 인스타그램이 대신하므로 옛 링크도 그쪽으로 엽니다
  return (TAB_IDS as readonly string[]).includes(h) ? (h as TabId) : 'notice'
}

function Skeleton({ rows }: { rows: number }) {
  return (
    <div className="news-skeleton" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  )
}

function NoticeRow({ n, i }: { n: Notice; i: number }) {
  const [open, setOpen] = useState(false)
  const hasBody = !!(n.content?.trim() || n.attachment)
  const bodyId = `notice-body-${i}`
  const head = (
    <>
      <span className="news-date">{n.date}</span>
      <span className="news-main">
        <span className="news-cat">{n.category}</span>
        <b>{n.title}</b>
      </span>
      {hasBody && <span className={`news-toggle ${open ? 'is-open' : ''}`} aria-hidden="true" />}
    </>
  )
  return (
    <li className="news-entry">
      {hasBody ? (
        <button type="button" className="news-row" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((o) => !o)}>
          {head}
        </button>
      ) : (
        <div className="news-row">{head}</div>
      )}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={bodyId}
            className="news-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease }}
          >
            <div className="news-body-inner">
              {n.attachment &&
                (IMAGE_EXT_RE.test(n.attachment) ? (
                  <img src={abs(n.attachment)} {...sizeOf(n.attachment)} alt={n.title} loading="lazy" decoding="async" />
                ) : (
                  <a className="btn btn-glass news-file" href={abs(n.attachment)} download>
                    {displayName(n.attachment)} 다운로드
                  </a>
                ))}
              {n.content
                ?.split(/\n{2,}/)
                .filter((p) => p.trim())
                .map((p, k) => (
                  <p key={k}>{p}</p>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

// Instagram's official embed script, loaded once and only when the 인스타그램 tab is first opened.
declare global {
  interface Window { instgrm?: { Embeds: { process: () => void } } }
}
let embedScript: Promise<void> | null = null
const loadEmbedScript = () =>
  (embedScript ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://www.instagram.com/embed.js'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      embedScript = null
      reject(new Error('instagram embed.js'))
    }
    document.body.appendChild(s)
  }))

const escapeHTML = (t: string) => t.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
// embed.js swaps each <blockquote> for an iframe, so the markup is handed over as raw HTML: React never
// owns those nodes and can't trip over the swap. If the script is blocked, the blockquote stays as a link card.
const embedHTML = (url: string, caption?: string) =>
  `<blockquote class="instagram-media" data-instgrm-permalink="${url}?utm_source=ig_embed" data-instgrm-version="14">` +
  `<a href="${url}" target="_blank" rel="noopener">${caption ? `<b>${escapeHTML(caption)}</b>` : ''}<span>Instagram에서 보기 ↗</span></a></blockquote>`

function InstagramFeed({ posts }: { posts: InstagramPost[] }) {
  const valid = posts.filter((p) => instagramPermalink(p.url))
  useEffect(() => {
    let alive = true
    loadEmbedScript()
      .then(() => alive && window.instgrm?.Embeds.process())
      .catch(() => {}) // 차단되면 링크 카드로 남습니다
    return () => {
      alive = false
    }
  }, [posts])
  return (
    <>
      <div className="insta-head">
        <p>
          사업단 인스타그램 <b>@idea.myongji</b>에 올라온 활동 소식입니다
        </p>
        <a className="btn btn-glass" href={LINKS.instagram} target="_blank" rel="noopener">
          인스타그램에서 더 보기
          <svg className="btn-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" /></svg>
        </a>
      </div>
      {valid.length ? (
        <div className="insta-grid">
          {valid.map((p) => (
            <div key={p.url} className="insta-item" dangerouslySetInnerHTML={{ __html: embedHTML(p.url, p.caption) }} />
          ))}
        </div>
      ) : (
        <p className="list-empty">등록된 게시물이 없습니다. 인스타그램 게시물이 등록되면 이곳에 표시됩니다.</p>
      )}
    </>
  )
}

// Lightbox for multi-photo albums: arrows / Esc on keyboard, swipe on touch.
function Lightbox({ album, onClose }: { album: GalleryItem; onClose: () => void }) {
  const images = album.images ?? (album.image ? [album.image] : [])
  const [idx, setIdx] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)
  const touchX = useRef<number | null>(null)
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length])
  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length])

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prevFocus?.focus()
    }
  }, [next, prev, onClose])

  const src = images[idx]
  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={album.caption || album.date}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 40) (dx < 0 ? next : prev)()
        touchX.current = null
      }}
    >
      <button ref={closeRef} type="button" className="lb-close" onClick={onClose} aria-label="닫기">
        ×
      </button>
      <figure className="lb-figure">
        <AnimatePresence mode="wait">
          <motion.img
            key={src}
            src={abs(src)}
            {...sizeOf(src)}
            alt={`${album.caption || album.date} (${idx + 1}/${images.length})`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
        <figcaption>
          <span>{album.date}</span>
          {album.caption && <b>{album.caption}</b>}
          {images.length > 1 && (
            <span className="lb-count">
              {idx + 1} / {images.length}
            </span>
          )}
        </figcaption>
      </figure>
      {images.length > 1 && (
        <>
          <button type="button" className="lb-nav lb-prev" onClick={prev} aria-label="이전 사진">
            ‹
          </button>
          <button type="button" className="lb-nav lb-next" onClick={next} aria-label="다음 사진">
            ›
          </button>
        </>
      )}
    </motion.div>
  )
}

export default function NewsPage() {
  const notices = useData<Notice>('news.json')
  const instagram = useData<InstagramPost>('instagram.json')
  const gallery = useData<GalleryItem>('gallery.json')
  const [album, setAlbum] = useState<GalleryItem | null>(null)
  const [tab, setTab] = useState<TabId>(() => readHashTab())
  const count = (d: Load<unknown>) => (d.state === 'ok' ? d.items.length : undefined)
  const TABS: { id: TabId; label: string; count?: number }[] = [
    { id: 'notice', label: '공지사항', count: count(notices) },
    { id: 'instagram', label: '인스타그램', count: count(instagram) },
    { id: 'gallery', label: '포토갤러리', count: count(gallery) },
  ]
  // Keep the tab in the URL hash so links like news.html#gallery (used on the original site) open it.
  const selectTab = (id: TabId) => {
    setTab(id)
    history.replaceState(null, '', `#${id}`)
  }
  useEffect(() => {
    const onHash = () => setTab(readHashTab())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const onTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const i = TAB_IDS.indexOf(tab)
    const nextId = TAB_IDS[(i + (e.key === 'ArrowRight' ? 1 : TAB_IDS.length - 1)) % TAB_IDS.length]
    selectTab(nextId)
    document.getElementById(`tab-${nextId}`)?.focus()
  }
  const closeAlbum = useCallback(() => setAlbum(null), [])

  return (
    <>
      <Ambient />
      <Nav />
      <main id="main-content">
        <SubHero
          title="사업단소식"
          en="NEWS"
          lead="IDEA 사업단의 공지사항과 활동 소식을 안내합니다"
          toc={[]}
        />

        <section className="section news-section">
          <div className="news-tabs" role="tablist" aria-label="사업단소식 분류" onKeyDown={onTabKey}>
            {TABS.map((t) => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                tabIndex={tab === t.id ? 0 : -1}
                className={`news-tab ${tab === t.id ? 'is-active' : ''}`}
                onClick={() => selectTab(t.id)}
              >
                {tab === t.id && <motion.span className="news-tab-pill" layoutId="news-tab-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className="news-tab-label">{t.label}</span>
                {t.count != null && <span className="news-tab-count">{t.count}</span>}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              id={`panel-${tab}`}
              role="tabpanel"
              aria-labelledby={`tab-${tab}`}
              className="news-panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease }}
            >
              {tab === 'notice' && (
                <>
          {notices.state === 'loading' && <Skeleton rows={3} />}
          {notices.state === 'error' && <p className="list-empty">공지사항을 불러오지 못했습니다.</p>}
          {notices.state === 'ok' &&
            (notices.items.length ? (
              <ul className="news-list">
                {notices.items.map((n, i) => (
                  <NoticeRow key={`${n.date}-${n.title}`} n={n} i={i} />
                ))}
              </ul>
            ) : (
              <p className="list-empty">등록된 공지사항이 없습니다.</p>
            ))}
                </>
              )}
              {tab === 'instagram' && (
                <>
          {instagram.state === 'loading' && <Skeleton rows={2} />}
          {instagram.state === 'error' && <p className="list-empty">인스타그램 게시물을 불러오지 못했습니다.</p>}
          {instagram.state === 'ok' && <InstagramFeed posts={instagram.items} />}
                </>
              )}
              {tab === 'gallery' && (
                <>
          {gallery.state === 'loading' && <Skeleton rows={2} />}
          {gallery.state === 'error' && <p className="list-empty">포토갤러리를 불러오지 못했습니다.</p>}
          {gallery.state === 'ok' &&
            (gallery.items.length ? (
              <div className="gallery">
                {gallery.items.map((g, i) => {
                  const imgs = g.images ?? (g.image ? [g.image] : [])
                  return (
                    <motion.button
                      key={`${g.date}-${i}`}
                      type="button"
                      className="gallery-card"
                      onClick={() => setAlbum(g)}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.8, ease, delay: (i % 3) * 0.08 }}
                    >
                      <img src={abs(imgs[0] || '')} {...sizeOf(imgs[0])} alt={g.caption || g.date} loading="lazy" decoding="async" />
                      <span className="gallery-meta">
                        <span>{g.date}</span>
                        {g.caption && <b>{g.caption}</b>}
                      </span>
                      {imgs.length > 1 && <span className="gallery-count">+{imgs.length - 1}</span>}
                    </motion.button>
                  )
                })}
              </div>
            ) : (
              <p className="list-empty">등록된 사진이 없습니다. 행사 사진이 등록되면 이곳에 표시됩니다.</p>
            ))}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        <NextPage
          title="IDEA 사업단과 함께 성장할 준비가 되셨나요?"
          desc="참여학과 재학생이라면 누구나 마이크로디그리와 4대 핵심 프로그램에 참여할 수 있습니다"
          href={LINKS.reserve}
          label="라운지 예약"
        />
      </main>
      <Footer />
      <AnimatePresence>{album && <Lightbox album={album} onClose={closeAlbum} />}</AnimatePresence>
    </>
  )
}
