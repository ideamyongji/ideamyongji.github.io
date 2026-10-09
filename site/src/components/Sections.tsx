import { LINKS } from '../links'
import { COMPETENCIES, ease } from '../content'
import { useData, type Notice } from '../newsData'
import { useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'


export function Issue({ no, label }: { no: string; label: string }) {
  return (
    <motion.div
      className="issue"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease }}
    >
      <span className="issue-no">No. {no}</span>
      <span className="issue-line" />
      <span className="issue-label">{label}</span>
    </motion.div>
  )
}

/* ───────── Mission & Vision: side-by-side, scroll-scrubbed word reveal ───────── */
function Word({ children, progress, range, accent }: { children: string; progress: MotionValue<number>; range: [number, number]; accent?: boolean }) {
  const opacity = useTransform(progress, range, [0.12, 1])
  const blur = useTransform(progress, range, [6, 0])
  const filter = useTransform(blur, (v) => `blur(${v}px)`)
  // inline-block keeps hyphenated words ("AI-Native", "디자인-엔지니어링") from splitting across lines.
  return (
    <>
      <motion.span className={accent ? 'accent-text' : undefined} style={{ opacity, filter, display: 'inline-block' }}>
        {children}
      </motion.span>{' '}
    </>
  )
}

// Words reveal in order across both columns: mission over [0, .5], vision over [.5, 1].
function RevealText({ words, progress, from, to }: { words: { w: string; accent?: boolean }[]; progress: MotionValue<number>; from: number; to: number }) {
  const step = (to - from) / words.length
  return (
    <>
      {words.map((x, i) => (
        <Word key={i} progress={progress} range={[from + i * step, from + (i + 1) * step]} accent={x.accent}>
          {x.w}
        </Word>
      ))}
    </>
  )
}

const MISSION = 'Human Factors Literacy를 바탕으로, 인간 가치와 산업 경쟁력을 함께 높이는 디자인-엔지니어링 융합 인재를 양성합니다.'
  .split(' ')
  .map((w) => ({ w }))
const VISION = [
  ...'Responsible Product/Service 디자인 프로세스를 실현하는'.split(' ').map((w) => ({ w })),
  // Non-breaking space keeps the program name ‘IDEA DesignEer’ on one line.
  ...['AI-Native', '선도', '인재', '‘IDEA DesignEer’'].map((w) => ({ w, accent: true })),
  { w: '양성' },
]

export function Mission() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.55'] })
  return (
    <section ref={ref} className="section mission" id="mission">
      <Issue no="01" label="MISSION & VISION" />
      <div className="mv-grid">
        <div className="mv-col">
          <span className="label">MISSION</span>
          <p className="mv-text">
            <RevealText words={MISSION} progress={scrollYProgress} from={0} to={0.5} />
          </p>
        </div>
        <div className="mv-col">
          <span className="label">VISION</span>
          <p className="mv-text">
            <RevealText words={VISION} progress={scrollYProgress} from={0.5} to={1} />
          </p>
        </div>
      </div>
    </section>
  )
}

/* ───────── Competency: 4 glass cards with 3D tilt ───────── */

export function TiltCard({ letter, children, color, i }: { letter: string; children: React.ReactNode; color: string; i: number }) {
  const reduce = useReducedMotion()
  // Hovering the big letter lifts the whole card toward the viewer.
  const [lifted, setLifted] = useState(false)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 200, damping: 18 })
  const sry = useSpring(ry, { stiffness: 200, damping: 18 })
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const glare = useTransform([gx, gy], ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,.22), transparent 55%)`)

  return (
    <motion.div
      className="tilt-lift"
      animate={lifted && !reduce ? { y: -22, scale: 1.08, zIndex: 3 } : { y: 0, scale: 1, zIndex: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
    <motion.article
      className={`tilt-card glass ${lifted ? 'lifted' : ''}`}
      style={{ rotateX: srx, rotateY: sry, '--c': color } as never}
      initial={{ opacity: 0, y: 80, rotateX: 25 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 1, ease, delay: i * 0.1 }}
      onPointerMove={(e) => {
        if (reduce) return
        const r = e.currentTarget.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        ry.set((px - 0.5) * 18)
        rx.set(-(py - 0.5) * 18)
        gx.set(px * 100)
        gy.set(py * 100)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
        setLifted(false)
      }}
    >
      <motion.div className="glare" style={{ background: glare }} />
      <span className="comp-letter" onPointerEnter={() => setLifted(true)} onPointerLeave={() => setLifted(false)}>
        {letter}
      </span>
      {children}
    </motion.article>
    </motion.div>
  )
}

export function Competency() {
  return (
    <section className="section" id="competency">
      <Issue no="02" label="IDEA DesignEer" />
      <h2 className="section-title">
        네 개의 글자, <span className="accent-text">하나의 인재상</span>
      </h2>
      <div className="comp-grid">
        {COMPETENCIES.map((c, i) => (
          <TiltCard key={c.ch} letter={c.ch} color={c.c} i={i}>
            <span className="comp-en">{c.en}</span>
            <p className="comp-ko">{c.ko}</p>
          </TiltCard>
        ))}
      </div>
    </section>
  )
}

/* ───────── Majors: hairline stat row + department list ───────── */
const STATS = [
  { v: '3개', l: '참여 학과' },
  { v: '409명', l: '참여 재학생' },
  { v: '15명', l: '참여 교수진' },
  { v: '’26.05–’27.02', l: '1단계 사업 기간' },
]

const MAJORS = [
  { name: '산업경영공학과', en: 'Industrial & Management Eng.', n: 226, desc: 'AI 융합기술기획·정형/비정형 데이터·강화학습·AI Agent 설계 등 Product 기획·설계·생산·품질 전 분야 전문가 9명이 참여합니다.' },
  { name: '비주얼커뮤니케이션디자인학과', en: 'Visual Communication Design', n: 92, desc: '첨단기술문화를 디자인에 접목해 시각 커뮤니케이션의 전략 및 실행자를 양성합니다. UI/UX·디지털콘텐츠·정보디자인 전문 교수진이 함께합니다.' },
  { name: '인더스트리얼디자인학과', en: 'Industrial Design', n: 91, desc: '기술과 디자인을 융합해 아이디어를 실물로 구현하는 창의적 전문가를 양성합니다. AI 디자인프로세스·디자인컨셉·인터랙션디자인을 다룹니다.' },
]

export function Majors() {
  return (
    <section className="section" id="about">
      <Issue no="03" label="CONVERGENCE" />
      <div className="stats">
        {STATS.map((st, i) => (
          <motion.div
            key={st.l}
            className="stat"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease, delay: i * 0.1 }}
          >
            <b className="stat-num">{st.v}</b>
            <span>{st.l}</span>
          </motion.div>
        ))}
      </div>

      <div className="majors">
        {MAJORS.map((m, i) => (
          <motion.div
            key={m.name}
            className="major"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease, delay: i * 0.08 }}
          >
            <span className="major-idx">0{i + 1}</span>
            <div>
              <h3>{m.name}</h3>
              <span className="major-en">{m.en}</span>
            </div>
            <p>{m.desc}</p>
            <span className="major-n">{m.n}명</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ───────── Curriculum: three steps rising like a staircase ───────── */
const STEPS = [
  { k: 'KNOWLEDGE', t: '디자인-엔지니어링 기초 교과목', d: '인공지능을 포함한 첨단기술에 대한 이해를 높이고, 디자인 기초 역량을 함양합니다.', c: 'var(--tone-2)' },
  { k: 'TOOLS', t: '전공·개별연구분야 핵심 교과목', d: '제품 및 서비스 개발 프로세스 전 과정에 활용할 수 있는 AI 및 디자인 도구를 실습합니다.', c: 'var(--tone-1)' },
  { k: 'EXPERIENCE', t: '융합캡스톤디자인(IC-PBL)', d: '기업 수요 맞춤형 프로젝트를 진행하여 실무 역량을 함양하고 동기를 부여합니다.', c: 'var(--tone-3)' },
]

export function Curriculum() {
  return (
    <section className="section" id="curriculum">
      <Issue no="04" label="MICRO-DEGREE" />
      <h2 className="section-title small">
        연계·융합 마이크로디그리 <span className="accent-text">“AI 디자인-엔지니어링”</span>
      </h2>
      <p className="section-lead">Knowledge에서 Tools를 거쳐 Experience에 이르는 3단계 교육과정으로 설계했습니다</p>
      <ol className="stairs">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.k}
            className="stair"
            style={{ '--c': s.c, '--i': i } as React.CSSProperties}
            initial={{ opacity: 0, y: 90 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.1, ease, delay: i * 0.22 }}
          >
            <div className="curr-card glass">
              <div className="orb" aria-hidden="true" />
              <span className="curr-k" aria-hidden="true">{s.k}</span>
              <span className="curr-step">STEP 0{i + 1} · {s.k}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}

/* ───────── Programs: bento ───────── */
const PROGRAMS = [
  { t: 'IDEA 집중 부트캠프', d: '정규학기 전·후 방학 기간을 활용한 단기집중형 AI·디자인 툴 교육으로 역량을 강화합니다.', img: 'photos/bootcamp-1.jpg' },
  { t: 'IDEA 미니해커톤', d: '참여학과 전공 학생을 혼합 편성해 제한된 시간 내 기획-디자인-개발 전 과정을 경험합니다.', img: 'photos/hackathon-award.jpg' },
  { t: 'IDEA 네트워크', d: '네이버·SK AX·삼성SDS·토스 등 실무진을 멘토로 초빙해 산학 연계 세미나를 운영합니다.', img: 'photos/network-lecture.jpg' },
  { t: 'IDEA 라운지', d: '참여학과 학생이 언제든 협업하고 AI·디자인 툴을 활용할 수 있는 전용 인프라 공간입니다.', img: 'orig/lounge_440x330.jpg' },
]

function ProgramCard({ p, i }: { p: (typeof PROGRAMS)[number]; i: number }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])
  return (
    <motion.article
      ref={ref}
      className="program glass"
      initial={{ opacity: 0, y: 60, clipPath: 'inset(20% 0% 0% 0% round 28px)' }}
      whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 28px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1.1, ease, delay: (i % 2) * 0.1 }}
    >
      <div className="program-media">
        <motion.img src={p.img} alt="" style={{ y }} loading="lazy" />
      </div>
      <div className="program-body">
        <span className="program-idx">0{i + 1}</span>
        <h3>{p.t}</h3>
        <p>{p.d}</p>
      </div>
    </motion.article>
  )
}

export function Programs() {
  return (
    <section className="section" id="programs">
      <Issue no="05" label="PROGRAMS" />
      <h2 className="section-title">
        만들고, 부딪히고,
        <br />
        <span className="accent-text">함께 성장하는 네 가지 방법</span>
      </h2>
      <p className="section-lead">역량강화부터 실전응용, 현장연계, 인프라지원까지 전주기적으로 IDEA DesignEer의 성장을 지원합니다</p>
      <div className="bento">
        {PROGRAMS.map((p, i) => (
          <ProgramCard key={p.t} p={p} i={i} />
        ))}
      </div>
    </section>
  )
}

/* ───────── Latest news (live from the original site's data) ───────── */
export function NewsPreview() {
  const notices = useData<Notice>('news.json')
  return (
    <section className="section" id="news">
      <div className="news-preview-head">
        <div>
          <Issue no="06" label="NEWS" />
          <h2 className="section-title small">사업단소식</h2>
          <p className="section-lead">IDEA 사업단의 주요 일정과 소식을 확인하세요</p>
        </div>
        <a className="btn btn-glass" href={`${LINKS.news}#notice`}>사업단소식 더보기 →</a>
      </div>
      {notices.state === 'loading' && <div className="news-skeleton" aria-hidden="true"><span /><span /><span /></div>}
      {notices.state === 'ok' &&
        (notices.items.length ? (
          <ul className="news-list">
            {notices.items.slice(0, 3).map((n, i) => (
              <motion.li
                key={`${n.date}-${n.title}`}
                className="news-entry"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, ease, delay: i * 0.08 }}
              >
                <a className="news-row" href={`${LINKS.news}#notice`}>
                  <span className="news-date">{n.date}</span>
                  <span className="news-main">
                    <span className="news-cat">{n.category}</span>
                    <b>{n.title}</b>
                  </span>
                  <span className="news-go" aria-hidden="true">→</span>
                </a>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="list-empty">등록된 소식이 없습니다.</p>
        ))}
    </section>
  )
}

/* ───────── CTA + Footer ───────── */
// Contact details mirror the original site's 오시는 길 page (contact.html) verbatim.
const MAP_URL = 'https://www.google.com/maps?q=' + encodeURIComponent('경기도 용인시 처인구 명지로 116')
const DIRECTIONS: { k: string; v: React.ReactNode }[] = [
  { k: '주소', v: '경기도 용인시 처인구 명지로 116, 명지대학교 자연캠퍼스' },
  { k: 'IDEA 라운지', v: '제1공학관 513호' },
  { k: '주관학과', v: '산업경영공학과 (사업단장 한민탁 교수)' },
  { k: '이메일', v: <a href="mailto:mthan@mju.ac.kr">mthan@mju.ac.kr</a> },
  { k: '참여학과', v: '산업경영공학과 · 비주얼커뮤니케이션디자인학과 · 인더스트리얼디자인학과' },
  { k: '지하철', v: '용인경전철(에버라인) 명지대역 하차' },
  { k: '버스', v: '명지대학교 자연캠퍼스 정류장 하차 후 도보 이동' },
]

export function Finale() {
  return (
    <>
      <section className="section finale">
        <motion.div
          className="finale-card glass"
          initial={{ opacity: 0, scale: 0.92, y: 60 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.1, ease }}
        >
          <div className="finale-orb" aria-hidden="true" />
          <div className="finale-bubble b1" aria-hidden="true" />
          <div className="finale-bubble b2" aria-hidden="true" />
          <h2>
            IDEA 사업단과 함께 <span className="accent-text">성장할 준비가 되셨나요?</span>
          </h2>
          <p>참여학과 재학생이라면 누구나 마이크로디그리와 4대 핵심 프로그램에 참여할 수 있습니다</p>
          <div className="hero-cta">
            <a className="btn btn-solid" href={LINKS.reserve}>라운지 예약</a>
            <a className="btn btn-glass" href={LINKS.news}>사업단 소식</a>
          </div>
        </motion.div>
      </section>

      <section className="section directions" id="contact">
        <div className="directions-head">
          <Issue no="07" label="LOCATION" />
          <h2 className="section-title small">오시는 길</h2>
          <p className="section-lead">명지대학교 자연캠퍼스 산업경영공학과, IDEA 사업단으로 오시는 길을 안내합니다</p>
          <a className="btn btn-glass" href={MAP_URL}>
            지도에서 보기
            <svg className="btn-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" /></svg>
          </a>
        </div>
        <dl className="directions-list">
          {DIRECTIONS.map((d, i) => (
            <motion.div
              key={d.k}
              className="directions-row"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, ease, delay: i * 0.05 }}
            >
              <dt>{d.k}</dt>
              <dd>{d.v}</dd>
            </motion.div>
          ))}
        </dl>
      </section>
    </>
  )
}
