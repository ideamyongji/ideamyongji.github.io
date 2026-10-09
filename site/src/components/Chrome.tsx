import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { LINKS } from '../links'

// Page chrome shared by the landing page and every sub-page: nav, ambient backdrop, footer.

// Menu mirrors the original site's header (labels and grouping), pointing at the rebuilt pages.
type NavItem = { href: string; label: string; page?: string; children?: { href: string; label: string }[] }
const NAV: NavItem[] = [
  {
    href: LINKS.about,
    label: '사업단소개',
    page: 'about',
    children: [
      { href: `${LINKS.about}#vision`, label: '비전과 목표' },
      { href: `${LINKS.about}#need`, label: '추진 필요성' },
      { href: `${LINKS.about}#align`, label: '대학발전계획 연계' },
      { href: LINKS.people, label: '참여인력' },
    ],
  },
  {
    href: LINKS.programs,
    label: '특성화계획',
    page: 'programs',
    children: [
      { href: `${LINKS.programs}#micro`, label: '마이크로디그리' },
      { href: `${LINKS.programs}#program`, label: '4대 핵심 프로그램' },
      { href: `${LINKS.career}#career`, label: '진로지도계획' },
      { href: `${LINKS.career}#industry`, label: '산학협력계획' },
    ],
  },
  {
    href: LINKS.news,
    label: '사업단소식',
    page: 'news',
    children: [
      { href: `${LINKS.news}#notice`, label: '공지사항' },
      { href: `${LINKS.news}#archive`, label: '자료실' },
      { href: `${LINKS.news}#gallery`, label: '포토갤러리' },
    ],
  },
  { href: LINKS.contact, label: '오시는 길' },
]

// Which top-level item the current page belongs to (people → 사업단소개, career → 특성화계획).
const currentSection = () => {
  const file = window.location.pathname.split('/').pop() || ''
  if (/^(about|people)\.html$/.test(file)) return 'about'
  if (/^(programs|career)\.html$/.test(file)) return 'programs'
  if (/^news\.html$/.test(file)) return 'news'
  return ''
}

function DesktopItem({
  item,
  active,
  open,
  onOpen,
  onClose,
}: {
  item: NavItem
  active: boolean
  open: boolean
  onOpen: () => void
  onClose: () => void
}) {
  return (
    <div
      className={`nav-item ${active ? 'is-active' : ''}`}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onFocus={onOpen}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && onClose()}
    >
      <a
        href={item.href}
        aria-current={active ? 'page' : undefined}
        aria-haspopup={item.children ? 'true' : undefined}
        aria-expanded={item.children ? open : undefined}
      >
        {item.label}
      </a>
      <AnimatePresence>
        {item.children && open && (
          <motion.div
            className="nav-drop glass"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {item.children.map((c) => (
              <a key={c.href} href={c.href} onClick={onClose}>
                {c.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MobileMenu({ onClose, active }: { onClose: () => void; active: string }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])
  return (
    <motion.div
      className="mnav"
      id="mobile-menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <nav aria-label="전체 메뉴" className="mnav-inner">
        {NAV.map((n, i) => (
          <motion.div
            key={n.href}
            className={`mnav-group ${active === n.page ? 'is-active' : ''}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 + i * 0.05 }}
          >
            <a className="mnav-top" href={n.href} onClick={onClose}>
              {n.label}
            </a>
            {n.children && (
              <div className="mnav-sub">
                {n.children.map((c) => (
                  <a key={c.href} href={c.href} onClick={onClose}>
                    {c.label}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        ))}
        <a className="btn btn-solid mnav-cta" href={LINKS.reserve}>
          라운지 예약
        </a>
      </nav>
    </motion.div>
  )
}

export function Nav() {
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const [hidden, setHidden] = useState(false)
  const [entered, setEntered] = useState(false)
  const [openItem, setOpenItem] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active] = useState(currentSection)
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  // Hide while reading downward, reveal on any upward scroll; always visible near the top
  // or while a menu is open.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    if (openItem || mobileOpen) return
    if (y < 120) setHidden(false)
    else if (y > prev + 4) setHidden(true)
    else if (y < prev - 4) setHidden(false)
  })

  return (
    <>
      <a className="skip-link" href="#main-content">
        본문으로 바로가기
      </a>
      <motion.header
        className="nav glass"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={entered ? { duration: 0.45, ease: [0.16, 1, 0.3, 1] } : { duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onAnimationComplete={() => setEntered(true)}
        onFocusCapture={() => setHidden(false)}
        onKeyDown={(e) => e.key === 'Escape' && setOpenItem(null)}
      >
        <a href={LINKS.home} className="nav-brand" aria-label="IDEA 사업단 홈">
          <img src="brand/idea-mark.svg" alt="" width={26} height={30} />
          <span>IDEA</span>
        </a>
        <nav aria-label="주요 메뉴" className="nav-menu">
          {NAV.map((n) => (
            <DesktopItem
              key={n.href}
              item={n}
              active={active === n.page}
              open={openItem === n.href}
              onOpen={() => setOpenItem(n.href)}
              onClose={() => setOpenItem((o) => (o === n.href ? null : o))}
            />
          ))}
        </nav>
        <a href={LINKS.reserve} className="nav-cta">
          라운지 예약
        </a>
        <button
          type="button"
          className={`nav-burger ${mobileOpen ? 'is-open' : ''}`}
          aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <i />
          <i />
        </button>
        <span className="nav-progress-clip" aria-hidden="true">
          <motion.i className="nav-progress" style={{ scaleX: progress }} />
        </span>
      </motion.header>
      <AnimatePresence>{mobileOpen && <MobileMenu onClose={closeMobile} active={active} />}</AnimatePresence>
    </>
  )
}

// Slow-drifting blurred bubbles behind the page; parallax at different depths.
export function Ambient() {
  const { scrollYProgress } = useScroll()
  const y1 = useTransform(scrollYProgress, [0, 1], ['0vh', '-60vh'])
  const y2 = useTransform(scrollYProgress, [0, 1], ['0vh', '-120vh'])
  const y3 = useTransform(scrollYProgress, [0, 1], ['0vh', '40vh'])
  return (
    <div className="ambient" aria-hidden="true">
      <motion.i className="a1" style={{ y: y1 }} />
      <motion.i className="a2" style={{ y: y2 }} />
      <motion.i className="a3" style={{ y: y3 }} />
    </div>
  )
}

// Footer links mirror the original site's footer.
const FOOTER_COLS = [
  { h: '사업단소개', links: [
    { t: '비전과 목표', href: `${LINKS.about}#vision` },
    { t: '추진 필요성', href: `${LINKS.about}#need` },
    { t: '참여인력', href: LINKS.people },
  ] },
  { h: '특성화계획', links: [
    { t: '마이크로디그리', href: LINKS.programs },
    { t: '진로·산학협력', href: LINKS.career },
  ] },
  { h: '바로가기', links: [
    { t: '라운지 예약', href: LINKS.reserve },
    { t: '사업단소식', href: LINKS.news },
    { t: '오시는 길', href: LINKS.contact },
    { t: '명지대학교', href: LINKS.mju },
    { t: '대학혁신지원사업단', href: LINKS.innov },
  ] },
]

export function Footer() {
  return (
  <footer className="footer">
    <div className="footer-top">
      <div className="footer-brand">
        <div className="footer-logos">
          <img className="footer-lockup" src="brand/idea-lockup.png" alt="IDEA 인공지능 융합 디자인-엔지니어링 사업단" width={705} height={188} />
          <img className="footer-mju" src="orig/mju-wordmark.png" alt="명지대학교 MYONGJI UNIVERSITY" width={121} height={37} />
        </div>
        <p>
          인공지능 융합 디자인-엔지니어링 사업단(IDEA)은 명지대학교 산업경영공학과·비주얼커뮤니케이션디자인학과·인더스트리얼디자인학과가
          함께하는 교내 자율형 특성화사업단입니다.
        </p>
      </div>
      {FOOTER_COLS.map((col) => (
        <nav key={col.h} className="footer-col" aria-label={col.h}>
          <h5>{col.h}</h5>
          <ul>
            {col.links.map((l) => (
              <li key={l.t}>
                <a href={l.href}>{l.t}</a>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>
    <div className="footer-bottom">
      <img src="orig/innovation-badge.png" alt="대학혁신지원사업" width={117} height={54} />
      <small>© 2026 명지대학교 IDEA 사업단(인공지능 융합 디자인-엔지니어링 사업단). All rights reserved.</small>
    </div>
  </footer>
  )
}
