import { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { Ambient, Footer, Nav } from '../components/Chrome'
import { NextPage } from '../components/NextPage'
import { Issue } from '../components/Sections'
import { SubHero } from '../components/SubHero'
import { ease } from '../content'
import { LINKS } from '../links'

// All copy below is verbatim from the original career.html (the dated "2027년도 기술수요조사 공고 8~9월 예정"
// tag was removed at the client's request once that window passed).

const reveal = (i = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.9, ease, delay: i * 0.1 },
})

const PIPELINE = [
  {
    stage: '직무 설정',
    sub: '초기 역량진단 · 전담지도교수 매칭',
    t: 'AI 융합 디자인-엔지니어링 직무 맞춤형 1대1 커리어 로드맵 수립',
    d: '마이크로디그리 진입 시 학생의 강점(디자인성향 vs 공학성향)을 데이터로 진단하고, 공학-디자인 혼합 교수진으로 구성된 멘토풀(Pool)에서 전담지도교수를 매칭하여 학기별 1:1 진로 트래킹을 실시합니다.',
  },
  {
    stage: '포트폴리오 고도화',
    sub: '‘Working 프로토타입’ 클리닉',
    t: '동적 포트폴리오 제작 지원',
    d: '시각적 이미지 중심의 전통적 포트폴리오에서 탈피하여, 학생이 직접 개발한 ‘실제 작동하는 웹/앱 링크’, ‘GitHub 코드저장소’, ‘A/B 테스트 및 데이터분석 노션 리포트’를 통합한 입체적 포트폴리오 구축을 지도합니다.',
  },
  {
    stage: '산학 네트워킹',
    sub: '현업 밀착형 멘토링',
    t: '산업체 전문가 멘토단 운영 & ‘IDEA 리크루팅 데이’ 개최',
    d: '네이버·카카오·토스 등 IT 빅테크 기업 및 유망 스타트업 실무진을 멘토로 위촉해 최신 산업트렌드 특강, 커피챗, 모의 직무면접을 정기 진행합니다. 융합캡스톤디자인 전시회는 협력기업 인사담당자를 초청해 현장 채용면접·인턴십 스카우트로 이어집니다.',
  },
  {
    stage: '취·창업 연계',
    sub: '기술 주도형 인큐베이팅',
    t: '‘IDEA 테크 스타트업’ 인큐베이팅',
    d: '융합캡스톤디자인 산출물 중 사업성이 뛰어난 아이템을 발굴하여 소프트웨어저작권 등록 및 AI 비즈니스모델 특허출원을 적극 장려합니다.',
  },
]

// Connector lines in the ecosystem map draw outward from the hub when scrolled into view.
const draw = (axis: 'x' | 'y', delay: number) => ({
  initial: axis === 'x' ? { scaleX: 0 } : { scaleY: 0 },
  whileInView: axis === 'x' ? { scaleX: 1 } : { scaleY: 1 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.9, ease, delay },
})

// Career pipeline: a vertical line fills as the reader moves through the four stages.
function Pipeline() {
  const ref = useRef<HTMLOListElement>(null)
  const reduce = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.7', 'end 0.6'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 })
  const done = useMotionValue(1)
  return (
    <ol ref={ref} className="pipe">
      <span className="pipe-track" aria-hidden="true">
        <motion.i style={{ scaleY: reduce ? done : smooth }} />
      </span>
      {PIPELINE.map((p, i) => (
        <motion.li key={p.stage} className="pipe-row" {...reveal(0)}>
          <div className="pipe-stage">
            <span className="pipe-node" aria-hidden="true">{i + 1}</span>
            <b>{p.stage}</b>
            <span>{p.sub}</span>
          </div>
          <div className="pipe-card glass">
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  )
}

export default function CareerPage() {
  return (
    <>
      <Ambient />
      <Nav />
      <main id="main-content">
        <SubHero
          title="학생 진로 지도 · 산학협력"
          en="CAREER & INDUSTRY"
          lead="IDEA Career Pipeline과 산학협력·교외 지원사업 수주 계획을 소개합니다"
          toc={[
            { href: '#career', label: 'IDEA Career Pipeline' },
            { href: '#industry', label: '협력 생태계' },
            { href: '#external', label: '디자인기술개발사업 연계' },
          ]}
        />

        <section className="section" id="career">
          <Issue no="01" label="CAREER PIPELINE" />
          <h2 className="section-title small">IDEA Career Pipeline</h2>
          <p className="section-lead">직무 설정, 포트폴리오 고도화, 산학 네트워킹, 취·창업 연계로 이어지는 전주기 진로 설계를 지원합니다</p>
          <Pipeline />
        </section>

        <section className="section" id="industry">
          <Issue no="02" label="ECOSYSTEM" />
          <h2 className="section-title small">다양한 자원과 전문성을 공유하는 협력 생태계</h2>
          <p className="section-lead">
            <b className="lead-strong">최종 목표.</b> 인공지능 융합 디자인-엔지니어링 분야의 인재 양성 및 실무능력 강화를 위해 다양한 자원과 전문성을 공유합니다.
          </p>
          <div className="eco-map">
            <motion.article className="info-card glass eco-a" {...reveal(0)}>
              <h3>타대학과의 협력방안</h3>
              <p>
                <b className="lead-strong">융합 교육 표준 모델 개발.</b> 디자인 인텔리전스 분야는 다학제적 접근이 필수적이므로, 다양한 분야 전문가의 참여를 요구합니다. 공유형 교육 컨소시엄 구성을 목표로 협력합니다.
              </p>
            </motion.article>

            <div className="eco-hub-cell">
              <motion.i className="eco-line eco-line-l" {...draw('x', 0.3)} aria-hidden="true" />
              <motion.i className="eco-line eco-line-r" {...draw('x', 0.3)} aria-hidden="true" />
              <motion.div
                className="eco-hub"
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ type: 'spring', stiffness: 160, damping: 16 }}
              >
                <b>IDEA</b>
                <span>사업단</span>
              </motion.div>
            </div>

            <motion.article className="info-card glass eco-b" {...reveal(1)}>
              <h3>산업체와의 협력방안</h3>
              <p>
                <b className="lead-strong">산학협력 프로그램.</b> 기업체와 연계한 프로젝트 발굴을 통해 현장의 실제적 문제 인지 및 대응 경험을 축적합니다.
              </p>
              <ul className="prog-tags">
                <li>AI 융합 디자인 해커톤</li>
                <li>체험형 인턴십 프로그램</li>
              </ul>
            </motion.article>

            <div className="eco-c-cell">
              <motion.i className="eco-line eco-line-v" {...draw('y', 0.7)} aria-hidden="true" />
              <motion.article className="info-card glass eco-c" {...reveal(2)}>
                <h3>체험형 인턴십 프로그램</h3>
                <p>일정 기간 기업 소속 근무자로 현장에 투입되어 실제 업무를 수행하는 현장실습입니다.</p>
                <ul className="prog-tags">
                  <li>잠재 수요기업 · 인공지능 서비스 분야</li>
                  <li>창작을 위한 디지털 에셋 분야</li>
                </ul>
              </motion.article>
            </div>
          </div>
        </section>

        <section className="section" id="external">
          <Issue no="03" label="EXTERNAL PROJECT" />
          <h2 className="section-title small">산업통상부 디자인기술개발사업 연계</h2>
          <motion.figure className="ext-card glass" {...reveal(0)}>
            <div className="finale-orb" aria-hidden="true" />
            <blockquote>
              <p>“디자인 주도 제조혁신(로봇, 모빌리티, 바이오헬스, 스마트 제조, 스마트 홈)을 위해 2027년까지 5,000억 집중 투자”</p>
            </blockquote>
            <figcaption>산업통상부 K-디자인 혁신 전략 발표</figcaption>
            <ul className="prog-tags">
              <li>산업통상부 엔지니어링디자인과 · 디자인기술개발사업</li>
            </ul>
          </motion.figure>
        </section>

        <NextPage
          title="IDEA 사업단의 최근 소식이 궁금하신가요?"
          desc="사업단의 최신 공지사항과 자료실을 확인해보세요"
          href={LINKS.news}
          label="사업단소식"
        />
      </main>
      <Footer />
    </>
  )
}
