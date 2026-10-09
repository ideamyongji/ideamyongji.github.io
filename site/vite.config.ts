import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 이 폴더(site/)는 리뉴얼 사이트의 소스이고, 빌드 결과는 저장소 루트(한 단계 위)로 바로 나갑니다.
// GitHub Pages가 루트를 그대로 서비스하므로, 관리자(admin.html)·라운지 예약(reserve.html)·data/ 같은
// 기존 운영 파일과 한 곳에서 공존합니다.
//  - assetsDir를 'static'으로 둔 이유: 루트의 assets/ 에 업로드 사진·기존 스크립트가 있어서 충돌을 피하기 위함
//  - emptyOutDir=false: 루트를 비우면 운영 파일이 지워지므로 절대 비우지 않습니다 (옛 번들 정리는 npm run build 스크립트가 담당)
const pages = ['index', 'about', 'people', 'programs', 'career', 'news']

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: '..',
    emptyOutDir: false,
    assetsDir: 'static',
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(import.meta.dirname, `${p}.html`)])),
    },
  },
})
