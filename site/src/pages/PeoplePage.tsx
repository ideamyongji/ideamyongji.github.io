import { motion } from 'motion/react'
import { Ambient, Footer, Nav } from '../components/Chrome'
import { NextPage } from '../components/NextPage'
import { Issue } from '../components/Sections'
import { SubHero } from '../components/SubHero'
import { ease } from '../content'
import { LINKS } from '../links'

// All copy below is verbatim from the original people.html (the 91명 label for 인더스트리얼디자인학과
// is filled in from the landing page so all three groups share the same header format).

const reveal = (i = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.8, ease, delay: i * 0.06 },
})

// href: MJU faculty profile (empView.do) when one exists, otherwise the department's faculty list page.
type Person = { name: string; tags: string[]; lead?: boolean; href?: string }

// Profile photos live in public/people/<name>.jpg; list a name here once its file exists.
// Anyone not listed falls back to the pearl monogram.
const PHOTOS = new Set<string>([])
type Group = { id: string; dept: string; students: string; title: string; desc: string; tone: string; people: Person[] }

const GROUPS: Group[] = [
  {
    id: 'ime',
    dept: '산업경영공학과',
    students: '재학생 226명',
    title: 'Product · AI 전문가 그룹',
    desc: 'Product 기획-설계-생산-품질 및 AI 정형/비정형 데이터·융합기술기획·강화학습·Agent 설계 전문가 9명이 참여합니다',
    tone: 'var(--tone-2)',
    people: [
      { name: '한민탁', tags: ['Product', 'AI'], lead: true, href: 'https://www.mju.ac.kr/profsrIntrcn/mjukr/47/20210025/empView.do' },
      { name: '한영근', tags: ['Product', '설계'], href: 'https://www.mju.ac.kr/profsrIntrcn/mjukr/47/19951916/empView.do' },
      { name: '유우연', tags: ['Product', '생산'], href: 'https://www.mju.ac.kr/profsrIntrcn/mjukr/47/20040030/empView.do' },
      { name: '김종만', tags: ['Product', '품질'], href: 'https://www.mju.ac.kr/mjukr/802/subview.do' },
      { name: '김도현', tags: ['AI', '정형·비정형'], href: 'https://www.mju.ac.kr/profsrIntrcn/mjukr/47/20140784/empView.do' },
      { name: '김정수', tags: ['AI', '융합기술기획'], href: 'https://www.mju.ac.kr/profsrIntrcn/mjukr/47/20150395/empView.do' },
      { name: '김경민', tags: ['AI', '강화학습'], href: 'https://www.mju.ac.kr/profsrIntrcn/mjukr/47/20190103/empView.do' },
      { name: '김효중', tags: ['AI', 'Agent'], href: 'https://www.mju.ac.kr/profsrIntrcn/mjukr/47/20250288/empView.do' },
      { name: '임종욱', tags: ['Product', '설계'], href: 'https://www.mju.ac.kr/mjukr/802/subview.do' },
    ],
  },
  {
    id: 'vcd',
    dept: '비주얼커뮤니케이션디자인학과',
    students: '재학생 92명',
    title: '시각 커뮤니케이션 전략·실행 전문가 그룹',
    desc: '첨단기술문화를 디자인에 접목하여 시각 커뮤니케이션의 전략 및 실행자를 양성합니다',
    tone: 'var(--tone-1)',
    people: [
      { name: '오동우', tags: ['UI/UX', '사용자리서치'], href: 'https://www.mju.ac.kr/mjukr/816/subview.do' },
      { name: '최재은', tags: ['디지털콘텐츠'], href: 'https://www.mju.ac.kr/profsrIntrcn/mjukr/190/19961320/empView.do' },
      { name: '이정선', tags: ['정보디자인'], href: 'https://www.mju.ac.kr/profsrIntrcn/mjukr/190/20001306/empView.do' },
    ],
  },
  {
    id: 'id',
    dept: '인더스트리얼디자인학과',
    students: '재학생 91명',
    title: '실물 구현 창의적 전문가 그룹',
    desc: '기술과 디자인을 융합해 아이디어를 실물로 구현하여 창의적 전문가를 양성합니다',
    tone: 'var(--tone-3)',
    people: [
      { name: '김지헌', tags: ['AI', '디자인프로세스'], href: 'https://www.mju.ac.kr/mjukr/816/subview.do' },
      { name: '이성훈', tags: ['디자인컨셉'], href: 'https://www.mju.ac.kr/profsrIntrcn/mjukr/191/20070060/empView.do' },
      { name: '조기봉', tags: ['인터랙션디자인'], href: 'https://www.mju.ac.kr/mjukr/816/subview.do' },
    ],
  },
]

const STATS = [
  { v: '3개', l: '참여 학과' },
  { v: '15명', l: '참여 교수진' },
  { v: '409명', l: '참여 학과 재학생 수 합계' },
]

// Cards with a verified department profile URL become links; the rest stay static.
function PersonLink({ href, children, ...rest }: { href?: string; children: React.ReactNode; className: string; style: React.CSSProperties }) {
  return href ? (
    <a href={href} {...rest}>
      {children}
    </a>
  ) : (
    <div {...rest}>{children}</div>
  )
}

function PersonCard({ p, dept, tone, i }: { p: Person; dept: string; tone: string; i: number }) {
  return (
    <motion.li className="person-item" {...reveal(i)}>
      <PersonLink href={p.href} className="person glass" style={{ '--c': tone } as React.CSSProperties}>
      {PHOTOS.has(p.name) ? (
        <img className="person-avatar person-photo" src={`people/${p.name}.jpg`} alt="" width={64} height={64} loading="lazy" />
      ) : (
        <span className="person-avatar" aria-hidden="true">{p.name[0]}</span>
      )}
      <div className="person-body">
        <b className="person-name">
          {p.name} 교수
          {p.lead && <span className="person-badge">사업단장</span>}
        </b>
        <span className="person-dept">{dept}</span>
        <span className="person-tags">
          {p.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </span>
      </div>
      {p.href && (
        <svg className="person-go" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
      )}
      </PersonLink>
    </motion.li>
  )
}

export default function PeoplePage() {
  return (
    <>
      <Ambient />
      <Nav />
      <main id="main-content">
        <SubHero
          title="참여인력"
          en="PEOPLE"
          lead="AI-native 제품·서비스 기획-설계-개발 일련의 프로세스 분야별 전문가가 IDEA 사업단에 함께합니다"
          toc={GROUPS.map((g) => ({ href: `#${g.id}`, label: g.dept }))}
        />

        <section className="section people-stats-section">
          <div className="stats stats-3">
            {STATS.map((st, i) => (
              <motion.div key={st.l} className="stat" {...reveal(i)}>
                <b className="stat-num">{st.v}</b>
                <span>{st.l}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {GROUPS.map((g, gi) => (
          <section key={g.id} className="section people-group" id={g.id}>
            <Issue no={`0${gi + 1}`} label={`${g.dept} · ${g.students}`} />
            <h2 className="section-title small">{g.title}</h2>
            <p className="section-lead">{g.desc}</p>
            <ul className="people-grid">
              {g.people.map((p, i) => (
                <PersonCard key={p.name} p={p} dept={g.dept} tone={g.tone} i={i} />
              ))}
            </ul>
          </section>
        ))}

        <section className="section">
          <motion.div className="strategy-band" {...reveal(0)}>
            <div>
              <h3>사업단 대표 문의</h3>
              <p>사업단장 한민탁 교수 · 산업경영공학과</p>
            </div>
            <a className="btn btn-glass" href={LINKS.contact}>오시는 길 / 연락처</a>
          </motion.div>
        </section>

        <NextPage
          title="사업단 특성화계획"
          desc="연계·융합 마이크로디그리 교육과정과 4대 핵심 비교과 프로그램으로 IDEA DesignEer를 양성합니다"
          href={LINKS.programs}
          label="특성화계획"
        />
      </main>
      <Footer />
    </>
  )
}
