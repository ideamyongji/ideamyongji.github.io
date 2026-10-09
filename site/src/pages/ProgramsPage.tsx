import { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { Ambient, Footer, Nav } from '../components/Chrome'
import { NextPage } from '../components/NextPage'
import { Issue } from '../components/Sections'
import { SubHero } from '../components/SubHero'
import { ease } from '../content'
import { LINKS } from '../links'

// All copy below is verbatim from the original programs.html.

const reveal = (i = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.9, ease, delay: i * 0.1 },
})

const STEPS = [
  {
    k: 'KNOWLEDGE',
    t: '디자인-엔지니어링 기초 교과목',
    d: '인공지능을 포함한 첨단기술에 대한 이해를 높이고, 디자인 기초 역량을 함양하는 공통 기초 과목군입니다.',
    c: 'var(--tone-2)',
  },
  {
    k: 'TOOLS',
    t: '전공·개별연구분야 핵심 교과목',
    d: '제품 및 서비스 개발 프로세스 전 과정에 활용할 수 있는 AI 및 디자인 도구를 실습하는 심화 과목군입니다.',
    c: 'var(--tone-1)',
  },
  {
    k: 'EXPERIENCE',
    t: '융합캡스톤디자인(IC-PBL)',
    d: '기업 수요 맞춤형 프로젝트를 진행하여 실무 역량을 함양하고 동기를 부여하는 최종 실습 과목입니다.',
    c: 'var(--tone-3)',
  },
]

const PROGRAMS = [
  {
    cat: '역량강화',
    t: 'IDEA 집중 부트캠프',
    d: 'AI 기반 객관적 의사결정 및 지능형 서비스 설계 역량 강화를 위해, 정규학기 전·후 방학 기간을 활용하여 단기집중형 AI·디자인 툴 교육을 실시합니다.',
    tags: ['2026 신규개발 · Data-informed(D)', '2027 신규개발 · Agentic(A)'],
    img: 'photos/bootcamp-1.jpg',
  },
  {
    cat: '실전응용',
    t: 'IDEA 미니해커톤',
    d: '인간-인공지능 상호작용 최적화 및 인간 중심 창의적 문제해결 고도화를 목표로, 참여학과 전공 학생을 혼합 편성하여 제한된 시간 내 AI 도구를 활용한 기획-디자인-개발 전 과정을 경험합니다.',
    tags: ['2026 개선 · Ethical(E)', '2027 신규개발 · Ethical(E)'],
    img: 'photos/hackathon-award.jpg',
  },
  {
    cat: '현장연계',
    t: 'IDEA 네트워크',
    d: '산학 연계 통합 디자인 프로젝트 실습을 통한 실무 및 협업 역량 강화를 위해, 네이버·SK AX·삼성SDS·토스 등 기업 실무진을 멘토로 초빙하여 최신 기술 트렌드 세미나 및 포트폴리오 피드백 세션을 운영합니다.',
    tags: ['2026 신규개발 · Innovative(I)'],
    img: 'photos/network-lecture.jpg',
  },
  {
    cat: '인프라지원',
    t: 'IDEA 라운지',
    d: '참여학과 학생들이 언제든 협업하고 AI·디자인 툴을 활용할 수 있도록, 전용 인프라 공간 구축 및 상시 개방을 통해 AI-native 마인드셋을 장착합니다.',
    tags: ['융합 교육 인프라'],
    img: 'orig/lounge_440x330.jpg',
  },
]

const COURSES = [
  { y: '2026', kind: '신규 개발', course: 'AI 기반 디자인 의사결정', comp: 'Data-informed (D)', note: 'IDEA 집중 부트캠프 연계' },
  { y: '2026', kind: '개선', course: '인간공학', comp: 'Ethical (E)', note: 'IDEA 미니해커톤 연계' },
  { y: '2026', kind: '신규 개발', course: '융합캡스톤디자인', comp: 'Innovative (I)', note: 'IDEA 네트워크 · IC-PBL 연계' },
  { y: '2027', kind: '신규 개발', course: 'AI 에이전트 응용', comp: 'Agentic (A)', note: 'IDEA 집중 부트캠프 연계' },
  { y: '2027', kind: '신규 개발', course: '인간중심 디자인', comp: 'Ethical (E)', note: 'IDEA 미니해커톤 연계' },
]

// Micro-degree as a progress line: the track fills KNOWLEDGE → TOOLS → EXPERIENCE with scroll,
// and each step lights up as the fill reaches its node.
function FlowStep({ s, i, progress }: { s: (typeof STEPS)[number]; i: number; progress: MotionValue<number> }) {
  const at = i / (STEPS.length - 1)
  const on = useTransform(progress, [Math.max(0, at - 0.12), at], [0, 1])
  const opacity = useTransform(on, [0, 1], [0.35, 1])
  const scale = useTransform(on, [0, 1], [0.6, 1])
  return (
    <motion.li className="flow-step" style={{ opacity }}>
      <motion.span className="flow-node" style={{ scale }} aria-hidden="true" />
      <span className="curr-step">STEP 0{i + 1} · {s.k}</span>
      <h3>{s.t}</h3>
      <p>{s.d}</p>
    </motion.li>
  )
}

function MicroFlow() {
  const ref = useRef<HTMLOListElement>(null)
  const reduce = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.45'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 })
  const done = useMotionValue(1)
  const progress = reduce ? done : smooth
  return (
    <ol ref={ref} className="flow">
      <span className="flow-track" aria-hidden="true">
        <motion.i style={{ scaleX: progress }} />
        <motion.i className="flow-track-v" style={{ scaleY: progress }} />
      </span>
      {STEPS.map((s, i) => (
        <FlowStep key={s.k} s={s} i={i} progress={progress} />
      ))}
    </ol>
  )
}

export default function ProgramsPage() {
  return (
    <>
      <Ambient />
      <Nav />
      <main id="main-content">
        <SubHero
          title="사업단 특성화계획"
          en="PROGRAMS"
          lead="연계·융합 마이크로디그리 교육과정과 4대 핵심 비교과 프로그램으로 IDEA DesignEer를 양성합니다"
          toc={[
            { href: '#micro', label: '마이크로디그리' },
            { href: '#program', label: '4대 핵심 프로그램' },
            { href: '#courses', label: '교과목 개발계획' },
          ]}
        />

        <section className="section" id="micro">
          <Issue no="01" label="MICRO-DEGREE" />
          <h2 className="section-title small">
            연계·융합 마이크로디그리 <span className="accent-text">“AI 디자인-엔지니어링”</span>
          </h2>
          <p className="section-lead">Knowledge - Tools - Experience 3단계로 설계된 융합전공/모듈형 교육과정입니다</p>
          <MicroFlow />
        </section>

        <section className="section" id="program">
          <Issue no="02" label="PROGRAMS" />
          <h2 className="section-title small">4대 핵심 프로그램</h2>
          <p className="section-lead">교과 및 비교과 교육과정 체계의 우수성과 차별성을 갖춘 4대 핵심 비교과 프로그램을 운영합니다</p>
          <div className="prog-list">
            {PROGRAMS.map((p, i) => (
              <motion.article key={p.t} className="prog glass" {...reveal(i % 2)}>
                <div className="prog-media">
                  <img src={p.img} alt="" loading="lazy" />
                </div>
                <div className="prog-body">
                  <span className="prog-cat">{p.cat}</span>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                  <ul className="prog-tags">
                    {p.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="section" id="courses">
          <Issue no="03" label="COURSES" />
          <h2 className="section-title small">특성화 교과목 개발 및 개선 계획</h2>
          <p className="section-lead">
            IDEA DesignEer 4대 역량(Innovative · Data-informed · Ethical · Agentic)에 맞춘 신규·개선 교과목을 단계적으로 개발합니다
          </p>
          <div className="years">
            {['2026', '2027'].map((y, yi) => (
              <div key={y} className="year-col">
                <motion.h3 className="year-head" {...reveal(yi)}>
                  {y}
                  <span aria-hidden="true" />
                </motion.h3>
                <ul className="year-list">
                  {COURSES.filter((c) => c.y === y).map((c, i) => (
                    <motion.li key={c.course} className="course-card glass" {...reveal(yi + i)}>
                      <span className="course-letter" aria-hidden="true">{c.comp.match(/\((\w)\)/)?.[1]}</span>
                      <div className="course-body">
                        <span className={`course-kind ${c.kind === '개선' ? 'is-improve' : ''}`}>{c.kind}</span>
                        <b>{c.course}</b>
                        <span className="course-comp">{c.comp}</span>
                        <span className="course-note">{c.note}</span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <NextPage
          title="학생 진로 지도와 산학협력이 궁금하신가요?"
          desc="IDEA Career Pipeline과 산학협력·교외 지원사업 수주 계획을 확인해보세요"
          href={LINKS.career}
          label="진로·산학협력"
        />
      </main>
      <Footer />
    </>
  )
}
