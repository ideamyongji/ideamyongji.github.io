// Single source of truth for page URLs.
// 리뉴얼 사이트가 기존 사이트와 같은 저장소(같은 출처)에 합쳐졌으므로, 데이터·업로드 파일·예약 시스템은
// 모두 상대 경로로 가리킵니다. (예전에는 별도 주소의 기존 사이트를 절대 URL로 불러왔습니다.)
export const ORIGIN = './'

export const LINKS = {
  home: './',
  about: './about.html',
  people: './people.html',
  programs: './programs.html',
  career: './career.html',
  news: './news.html',
  reserve: `${ORIGIN}reserve.html`, // Firebase 기반 예약 시스템 (기존 페이지 그대로)
  contact: './#contact',
  instagram: 'https://www.instagram.com/idea.myongji/',
  mju: 'https://www.mju.ac.kr',
  innov: 'https://innov.mju.ac.kr',
}
