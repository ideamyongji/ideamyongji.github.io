import { motion } from 'motion/react'
import { ease } from '../content'

// Hand-off band at the end of every sub-page, leading readers to the next page in sequence.
export function NextPage({ title, desc, href, label }: { title: string; desc: string; href: string; label: string }) {
  return (
    <section className="section next-section">
      <motion.a
        className="next-page"
        href={href}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.9, ease }}
      >
        <span className="next-kicker">NEXT</span>
        <span className="next-body">
          <b>{title}</b>
          <span>{desc}</span>
        </span>
        <span className="next-cta">
          {label}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </motion.a>
    </section>
  )
}
