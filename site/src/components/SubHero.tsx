import { motion, useReducedMotion } from 'motion/react'
import { BubbleField } from './BubbleField'
import { LINKS } from '../links'
import { ease } from '../content'

// Low header shared by every sub-page: a few soap bubbles, breadcrumb, title, in-page table of contents.
export function SubHero({
  title,
  en,
  lead,
  toc,
}: {
  title: string
  en: string
  lead: string
  toc: { href: string; label: string }[]
}) {
  const reduce = useReducedMotion() ?? false
  return (
    <>
      <header className="subhero" id="top">
        <BubbleField paused={reduce} count={{ desktop: 5, mobile: 3 }} />
        <div className="subhero-inner">
          <motion.nav
            className="breadcrumb"
            aria-label="현재 위치"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
          >
            <a href={LINKS.home}>홈</a>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{title}</span>
          </motion.nav>
          <motion.h1
            className="subhero-title"
            initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: 0.3, ease }}
          >
            {title}
          </motion.h1>
          <motion.p
            className="subhero-en"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {en}
          </motion.p>
          <motion.p
            className="subhero-lead"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease }}
          >
            {lead}
          </motion.p>
        </div>
      </header>
      {toc.length > 0 && (
      <motion.nav
        className="toc"
        aria-label="페이지 목차"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.9, ease }}
      >
        {toc.map((t) => (
          <a key={t.href} href={t.href} className="toc-chip">
            {t.label}
          </a>
        ))}
      </motion.nav>
      )}
    </>
  )
}
