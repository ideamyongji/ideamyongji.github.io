# IDEA 사업단 홈페이지

인공지능 융합 디자인-엔지니어링 사업단(IDEA, Institute for Design Engineering with AI) 공식 홈페이지입니다.
명지대학교 산업경영공학과·비주얼커뮤니케이션디자인학과·인더스트리얼디자인학과가 참여하는 교내 자율형 특성화사업단 사이트입니다.

2026-10 디자인 리뉴얼(원본: [mju-bilab/idea-renewal](https://github.com/mju-bilab/idea-renewal))이 적용되어 있습니다.

## 구조 — 두 부분이 한 저장소에 공존합니다

GitHub Pages는 이 저장소의 **루트를 그대로** 서비스합니다(`main` 브랜치, 빌드 서버 없음).

| 구분 | 파일 | 설명 |
|---|---|---|
| **리뉴얼 사이트** (React + Vite + Motion) | `index/about/people/programs/career/news.html`, `static/`, `brand/`, `orig/`, `photos/` | **빌드 결과물**입니다. 직접 고치지 마세요. 소스는 `site/` |
| **리뉴얼 소스** | `site/` | `site/src`(화면), `site/public`(로고·사진), `site/*.html`(페이지별 메타) |
| **운영 도구** (기존 그대로) | `admin.html`, `reserve.html`, `reserve-admin.html`, `data/`, `assets/`, `sw.js`, `manifest.webmanifest`, `firestore.rules` | 공지·자료·갤러리 관리, Firebase 라운지 예약, 업로드된 사진·파일 |
| 이전 주소 호환 | `contact.html` | 메인의 `#contact`(오시는 길)로 이동시키는 안내 페이지 |

사업단소식 글·사진은 `admin.html`에서 올리면 `data/*.json`과 `assets/` 에 커밋되고, 리뉴얼 사이트가 같은 출처에서 바로 읽어 보여줍니다.

## 리뉴얼 사이트 수정·배포

```bash
cd site
npm install          # 최초 1회
npm run dev          # 개발 서버 (http://localhost:5173) — 데이터는 저장소 루트의 data/를 읽지 못하므로 화면 확인용
npm run build        # 저장소 루트로 빌드 (static/ 를 비우고 다시 생성, 운영 파일은 건드리지 않음)
```

빌드 후 생성·변경된 파일을 함께 커밋·push 하면 배포됩니다.
**빌드 결과물을 커밋하지 않으면 사이트가 바뀌지 않습니다.**

- 페이지 주소는 `site/src/links.ts` 한 곳에서 관리합니다.
- 교수진 사진: `site/public/people/<이름>.jpg`를 넣고 `site/src/pages/PeoplePage.tsx`의 `PHOTOS`에 이름을 추가합니다.
- 페이지별 제목·설명·OG 메타는 `site/*.html`에서 고칩니다.
- `site/vite.config.ts`의 `assetsDir: 'static'`, `emptyOutDir: false`는 루트의 `assets/`(업로드 사진)와
  운영 파일을 지키기 위한 설정이므로 바꾸지 마세요.

## 로컬 확인 (빌드 결과 + 운영 도구 전체)

```bash
python -m http.server 8000     # 저장소 루트에서. http://localhost:8000
```

## 운영 도구 메모

- `admin.html` — 비밀번호 잠금 + GitHub 토큰으로 공지·자료·갤러리를 등록/수정/삭제합니다. 검색엔진에는 노출되지 않습니다.
- `reserve.html` — IDEA 라운지 예약(Firebase). `sw.js`는 예약 앱 셸만 캐시하며 다른 페이지는 가로채지 않습니다.
- 리뉴얼 이전 디자인의 정적 페이지는 git 기록(`3e1dd96`)에 보존되어 있습니다. 문제가 생기면 그 커밋으로 되돌릴 수 있습니다.
- 운영 페이지(`admin.html`·`reserve.html`·`reserve-admin.html`)는 `assets/css/style.css` 위에 `assets/css/renewal-chrome.css`를 덧씌워
  리뉴얼 디자인(색·글꼴·유리 카드·내비·푸터)으로 맞춥니다. `reserve.html`의 내비 동작은 `assets/js/renewal-chrome.js`가 담당합니다.
  리뉴얼 사이트의 메뉴(`site/src/components/Chrome.tsx`)를 바꾸면 `reserve.html`의 내비·푸터도 함께 고쳐 주세요.
- `404.html` — 없는 주소로 들어오면 GitHub Pages가 보여주는 안내 페이지입니다. 어느 깊이의 주소에서도 열리므로 경로는 모두 `/`로 시작합니다.
- `sitemap.xml`·`robots.txt` — 검색엔진용 공개 페이지 목록과 수집 규칙입니다. 공개 페이지를 추가·삭제하면 `sitemap.xml`도 함께 고쳐 주세요.
  관리자 페이지 두 개는 `robots.txt`에서 수집을 막아 두었습니다.
- `assets/css/style.css`는 이전 디자인의 스타일시트로, 지금은 운영 페이지의 기본 컴포넌트(카드·버튼·입력창·탭 등)용으로만 남아 있습니다.
