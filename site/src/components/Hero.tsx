import { useCallback, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { BubbleField } from './BubbleField'
import { LINKS } from '../links'

const ease = [0.16, 1, 0.3, 1] as const

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion() ?? false
  const [pops, setPops] = useState(0)
  const onPop = useCallback(() => setPops((n) => n + 1), [])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [0, -140])
  const blur = useTransform(scrollYProgress, [0, 0.6], ['blur(0px)', 'blur(8px)'])

  return (
    <section ref={ref} className="hero" id="top">
      <BubbleField paused={reduce} onPop={onPop} />

      <motion.div className="hero-inner" style={reduce ? undefined : { opacity, y, filter: blur }}>
        <motion.p
          className="eyebrow glass-chip"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease }}
        >
          <span className="dot" /> 2026 대학혁신지원사업 · 자율형 특성화사업단
        </motion.p>
        <h1 className="wordmark">
          <span className="sr-only">IDEA 사업단 — 인공지능 융합 디자인-엔지니어링 사업단</span>
          {'IDEA'.split('').map((ch, i) => (
            <motion.span
              key={ch}
              aria-hidden="true"
              initial={{ opacity: 0, y: 60, filter: 'blur(16px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.4, delay: 0.35 + i * 0.12, ease }}
            >
              {ch}
            </motion.span>
          ))}
        </h1>
        <motion.p
          className="hero-name"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1, ease }}
        >
          인공지능 융합 디자인-엔지니어링 사업단
        </motion.p>
        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.15, ease }}
        >
          사람과 AI가 함께 만드는 디자인-엔지니어링의 미래
        </motion.p>
        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.3, ease }}
        >
          <a href="#mission" className="btn btn-solid">사업단 둘러보기</a>
          <a href={LINKS.reserve} className="btn btn-glass">
            라운지 예약
            <svg className="btn-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" /></svg>
          </a>
        </motion.div>
        <motion.p
          className="hero-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.2 }}
          aria-live="polite"
        >
          {pops === 0 ? '비눗방울을 눌러 터뜨려 보세요' : `톡! ${pops}개의 아이디어가 터졌어요`}
        </motion.p>
      </motion.div>

      <motion.div className="scroll-cue" style={{ opacity }} aria-hidden="true">
        <span>SCROLL</span>
        <i />
      </motion.div>
    </section>
  )
}
