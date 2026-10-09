import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { Ambient, Footer, Nav } from '../components/Chrome'
import { Issue } from '../components/Sections'
import { NextPage } from '../components/NextPage'
import { SubHero } from '../components/SubHero'
import { COMPETENCIES, ease } from '../content'
import { LINKS } from '../links'

// All copy below is verbatim from the original about.html.

const reveal = (i = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.9, ease, delay: i * 0.1 },
})

const NEEDS = [
  {
    t: '소통비용(Communication Cost) 절감',
    d: ['‘인공지능 융합 디자인-엔지니어링’ 인재 양성을 통해 기획자-디자이너-개발자 간 발생하는 고질적인 소통비용을 혁신적으로 절감합니다.'],
  },
  {
    t: '사일로 현상(Silo Effect) 해소',
    d: ['서로 다른 전문 영역으로 인한 사일로 현상을 근본적으로 해결하기 위해 기획-디자인-개발을 아우르는 공유 교차영역 지식을 규명하고 공통 언어를 설계합니다.'],
  },
  {
    t: '상상과 현실을 잇다… ‘AI 시대의 디자인’',
    d: [
      'AI Agent를 효과적으로 설계하고 효율적으로 운영·관리할 수 있는 핵심역량을 개발합니다. 아이디어를 떠올리는 초기 단계부터 실제 제품 구현에 이르는 전 과정에 AI가 함께하며 협력하는 새로운 방식입니다.',
      '제품의 기반 구조를 처음부터 AI가 잘 작동할 수 있게 재설계하는 ‘AI 네이티브’ 전략을 추구하며, 디자인과 개발의 경계를 허물고 AI와 사람이 협력해 창작하는 공동창작(co-creation) 기반의 제품개발 방식을 지향합니다.',
    ],
  },
]

const QUOTES = [
  { q: '“비(非)디자이너의 56%가 디자인 업무에 ‘많이’ 또는 ‘매우 많이’ 관여하고 있다고 답했다.”', c: 'Figma, 2025.09.10' },
  {
    q: '“21세기의 창의경제와 국가경쟁력은 첨단기술과 디자인에서 나온다. 디자인은 기술에 인간의 잠재적 욕구에 기반을 둔 기능·스토리·의미·감성·경험 등의 가치를 부여하고 사물에 생명력과 아름다움을 불어넣기 때문이다.”',
    c: '이순종 서울대 디자인학과 명예교수, 중앙일보, 2025.07.18',
  },
]

const STRATEGIES = [
  {
    t: 'AI-native 마인드셋 함양',
    d: 'AI-native mindset 함양은 Engineer, Designer 모두에게 핵심 역량입니다. 모든 워크플로우에 AI를 통합하는 가치를 이해하는 팀을 만들기 위한 공통 마인드셋을 내재화합니다.',
    s: 'Forbes 2025.12.04',
  },
  {
    t: '디자인-엔지니어링 융합',
    d: '기획자-디자이너-개발자의 교차영역은 AI 시대 모두가 갖춰야 할 핵심 역량입니다. 인공지능 융합 디자인 분야의 기획-디자인-개발 역량강화 교육모델을 설계합니다.',
    s: 'Fast Company 2026.04.02',
  },
  {
    t: '1인 3역 교육과 고용 연계',
    d: 'AI 도구를 활용한 문제해결 경험과 실행 가능한 의사결정 검증은 필수입니다. 다양한 AI·디자인 툴 사용 지원과 작동하는(working) 결과물 중심 발표회를 운영합니다.',
    s: 'AI Times 2025.1.20',
  },
]

const GROW = [
  { ch: 'G', t: '개인화된 맞춤형 학습', d: '역량 진단을 통한 학습자 개인의 진로에 적합한 실무 중심 포트폴리오 설계를 지원합니다.', c: 'var(--tone-1)' },
  { ch: 'R', t: '전교적 품질 강화', d: '교과과정 위원회에 산업체 자문위원을 별도 구성해 지속적인 교육품질을 제고하고, AI 응용 디자인-엔지니어링 역량 평가 체계를 마련합니다.', c: 'var(--tone-2)' },
  { ch: 'O', t: '교육과정 최적화', d: '이전에 시도되지 않았던 공학-디자인 융합 교육 초기 모델을 설계하고, 산업 수요 기반 요구 역량 분석을 통해 교육과정을 고도화합니다.', c: 'var(--tone-3)' },
  { ch: 'W', t: '전주기적 학생 지원', d: 'IDEA 라운지(융합 교육 인프라)를 조성하고, 취·창업 지원 프로그램 운영을 통한 맞춤형 지원을 활성화합니다.', c: 'var(--tone-4)' },
]

// One diagram morphs from T-shaped to π-shaped talent while pinned: the single stem splits in two
// and drifts apart, the shallow bar widens into the shared cross-domain layer, labels cross-fade.
function ShapeMorph() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const raw = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 })
  const p = useTransform(raw, [0.15, 0.75], [0, 1], { clamp: true })

  const barInset = useTransform(p, [0, 1], ['32%', '8%'])
  const stemL = useTransform(p, [0, 1], ['50%', '28%'])
  const stemR = useTransform(p, [0, 1], ['50%', '72%'])
  const tOpacity = useTransform(p, [0, 0.35], [1, 0])
  const piOpacity = useTransform(p, [0.55, 0.9], [0, 1])
  const piY = useTransform(p, [0.55, 0.9], [12, 0])

  const finalState = reduce
  return (
    <div ref={ref} className={`morph ${finalState ? 'static' : ''}`}>
      <div className="morph-sticky">
        <figure className="morph-card glass">
          <div className="morph-art" aria-hidden="true">
            <motion.i className="bar" style={finalState ? { left: '8%', right: '8%' } : { left: barInset, right: barInset }} />
            <motion.i className="stem" style={{ left: finalState ? '28%' : stemL }} />
            <motion.i className="stem stem-2" style={{ left: finalState ? '72%' : stemR }} />

            <motion.span className="tag tag-bar" style={{ opacity: finalState ? 0 : tOpacity }}>얕은 폭의 이해</motion.span>
            <motion.span className="tag tag-stem" style={{ opacity: finalState ? 0 : tOpacity }}>한 분야 깊은 전문성</motion.span>

            <motion.span className="tag tag-bar" style={{ opacity: finalState ? 1 : piOpacity }}>
              공유 교차영역 지식 · User Interaction Research
            </motion.span>
            <motion.span className="tag tag-l" style={finalState ? undefined : { opacity: piOpacity, y: piY }}>
              <b>Design Decision Making</b>
              Human Factors · 사용자 리서치 · 인간중심 디자인 프로세스
            </motion.span>
            <motion.span className="tag tag-r" style={finalState ? undefined : { opacity: piOpacity, y: piY }}>
              <b>AI Agent Engineering</b>
              정형·비정형 데이터 · 강화학습 · AI 에이전트 설계
            </motion.span>
          </div>

          <div className="morph-caption">
            <motion.figcaption style={{ opacity: finalState ? 0 : tOpacity }} aria-hidden={finalState}>
              <b>T자형 인재</b>
              <span>한 분야의 깊이는 갖추었지만, 인접 분야와는 통역이 필요합니다</span>
            </motion.figcaption>
            <motion.figcaption style={{ opacity: finalState ? 1 : piOpacity }}>
              <b>π(파이)형 인재, IDEA DesignEer</b>
              <span>두 개의 깊은 전문성을 공통 언어로 잇는, 통역이 필요 없는 인재</span>
            </motion.figcaption>
          </div>
        </figure>
        {!finalState && (
          <div className="morph-progress" aria-hidden="true">
            <span>T자형</span>
            <i><motion.b style={{ scaleX: p }} /></i>
            <span>π형</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <>
      <Ambient />
      <Nav />
      <main id="main-content">
        <SubHero
          title="사업단소개"
          en="ABOUT IDEA"
          lead="인공지능 융합 디자인-엔지니어링 사업단(IDEA)의 목표와 현황을 소개합니다"
          toc={[
            { href: '#need', label: '추진 필요성' },
            { href: '#vision', label: '비전과 목표' },
            { href: '#character', label: '특성화계획' },
            { href: '#align', label: '대학발전계획 연계' },
          ]}
        />

        <section className="section" id="need">
          <Issue no="01" label="NEED" />
          <h2 className="section-title small">인공지능 융합 디자인-엔지니어링 사업단, 왜 필요한가</h2>
          <p className="section-lead">
            인간과 인공지능이 본격적으로 협업하는 시대, 혁신적인 AI-Native 제품·서비스 개발을 위한 인공지능 융합 디자인-엔지니어링 전문 교육이 필요합니다
          </p>
          <div className="info-grid">
            {NEEDS.map((n, i) => (
              <motion.article key={n.t} className="info-card glass" {...reveal(i)}>
                <span className="info-idx">0{i + 1}</span>
                <h3>{n.t}</h3>
                {n.d.map((p) => (
                  <p key={p.slice(0, 12)}>{p}</p>
                ))}
              </motion.article>
            ))}
          </div>
          <div className="quotes">
            <motion.figure className="stat-quote" {...reveal(0)}>
              <span className="stat-quote-num" aria-hidden="true">56<small>%</small></span>
              <blockquote>
                <p>{QUOTES[0].q}</p>
              </blockquote>
              <figcaption>{QUOTES[0].c}</figcaption>
            </motion.figure>
            <motion.blockquote className="quote" {...reveal(1)}>
              <p>{QUOTES[1].q}</p>
              <cite>{QUOTES[1].c}</cite>
            </motion.blockquote>
          </div>
        </section>

        <section className="section" id="vision">
          <Issue no="02" label="VISION" />
          <h2 className="section-title small">사업단 비전 및 목표</h2>
          <div className="mv-grid">
            <motion.div className="mv-col" {...reveal(0)}>
              <span className="label">Mission</span>
              <p className="mv-text">
                Human Factors Literacy.{' '}
                <span className="accent-text">인간 가치 및 산업 경쟁력 증진을 위한 디자인-엔지니어링 융합 인재 양성 프로그램 개발 및 운영</span>
              </p>
            </motion.div>
            <motion.div className="mv-col" {...reveal(1)}>
              <span className="label">Vision</span>
              <p className="mv-text">
                Responsible Product/Service Design 프로세스를 실현하고, 인간의 가치와 산업 혁신을 동시에 추구하는{' '}
                <span className="accent-text">AI-Native 선도 인재 ‘IDEA DesignEer’</span> 양성
              </p>
            </motion.div>
          </div>

          <h3 className="sub-title">IDEA DesignEer 인재상</h3>
          <dl className="comp-row">
            {COMPETENCIES.map((c, i) => (
              <motion.div key={c.ch} className="comp-row-item" {...reveal(i)}>
                <dt>
                  <span className="comp-row-letter">{c.ch}</span>
                  <span className="comp-en">{c.en}</span>
                </dt>
                <dd>{c.ko}</dd>
              </motion.div>
            ))}
          </dl>

          <h3 className="sub-title">T자형을 넘어 π(파이)형 인재로</h3>
          <p className="section-lead narrow">
            User Interaction Research를 공통 언어로 삼아 Design Decision Making(Human Factors)과 AI Agent Engineering이 상호작용하는 디자인 프로세스를 통해, 전문성과 다양성이 조화된 다빈치형 인재를 양성합니다.
          </p>
          <ShapeMorph />
        </section>

        <section className="section" id="character">
          <Issue no="03" label="STRATEGY" />
          <h2 className="section-title small">사업단 특성화계획(융합인재 양성계획)</h2>
          <p className="section-lead">인공지능 융합 디자인-엔지니어링 인재 양성을 위해 다음과 같은 특성화 계획을 제시합니다</p>
          <ol className="plan-list">
            {STRATEGIES.map((st, i) => (
              <motion.li key={st.t} className="plan-item" {...reveal(i)}>
                <span className="plan-no">0{i + 1}</span>
                <div>
                  <h3>{st.t}</h3>
                  <p>{st.d}</p>
                </div>
                <span className="plan-source">{st.s}</span>
              </motion.li>
            ))}
          </ol>
        </section>

        <section className="section" id="align">
          <Issue no="04" label="ALIGNMENT" />
          <h2 className="section-title small">대학발전계획과 사업단 특성화 계획과의 정합성</h2>
          <p className="section-lead">
            사업단 특성화 계획은 MJU2030 발전계획 및 3주기 대학혁신지원사업의 ‘교육’ 및 ‘특성화’ 분야 혁신전략(G·R·O·W)과 긴밀히 연계됩니다
          </p>
          <div className="grow-grid">
            {GROW.map((g, i) => (
              <motion.article key={g.ch} className="grow-card glass" style={{ '--c': g.c } as React.CSSProperties} {...reveal(i)}>
                <span className="grow-letter">{g.ch}</span>
                <h3>{g.t}</h3>
                <p>{g.d}</p>
              </motion.article>
            ))}
          </div>
          <motion.div className="strategy-band" {...reveal(0)}>
            <div>
              <h3>국가전략산업 × 사회적 수요</h3>
              <p>국가전략산업으로서의 ‘디자인AX’와 사회적 수요로서의 ‘AI Design-Engineer’ 양성이 만나는 지점에 IDEA 사업단이 있습니다.</p>
            </div>
            <a className="btn btn-glass" href={LINKS.programs}>특성화 계획 보기 →</a>
          </motion.div>
        </section>

        <NextPage
          title="IDEA 사업단의 참여 교수진을 소개합니다"
          desc="3개 학과 15명의 교수진이 함께하는 IDEA 사업단의 사람들을 만나보세요"
          href={LINKS.people}
          label="참여인력"
        />
      </main>
      <Footer />
    </>
  )
}
