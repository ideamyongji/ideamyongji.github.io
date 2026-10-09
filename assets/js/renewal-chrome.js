// 리뉴얼 내비게이션 동작 (운영 페이지용: reserve.html)
// React 리뉴얼(site/src/components/Chrome.tsx)의 Nav와 같은 동작을 의존성 없이 재현합니다.
//  - 데스크톱 드롭다운: 마우스·키보드 포커스로 열기, Esc로 닫기
//  - 모바일 메뉴: 햄버거 토글, Esc·링크 클릭으로 닫기, 열려 있는 동안 본문 스크롤 잠금
//  - 아래로 스크롤하면 숨고 위로 올리면 다시 보임, 하단 진행 막대
(() => {
  const nav = document.querySelector('.rn-nav');
  if (!nav) return;

  // ── 데스크톱 드롭다운 ──
  const items = [...nav.querySelectorAll('.rn-item')];
  const setOpen = (item, open) => {
    item.classList.toggle('is-open', open);
    const link = item.querySelector(':scope > a[aria-haspopup]');
    if (link) link.setAttribute('aria-expanded', String(open));
  };
  items.forEach((item) => {
    if (!item.querySelector('.rn-drop')) return;
    item.addEventListener('mouseenter', () => setOpen(item, true));
    item.addEventListener('mouseleave', () => setOpen(item, false));
    item.addEventListener('focusin', () => setOpen(item, true));
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) setOpen(item, false); });
  });

  // ── 모바일 메뉴 ──
  const burger = nav.querySelector('.rn-burger');
  const mnav = document.getElementById('rn-mobile-menu');
  const setMobile = (open) => {
    if (!burger || !mnav) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    mnav.classList.toggle('is-open', open);
    mnav.toggleAttribute('inert', !open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) nav.classList.remove('is-hidden');
  };
  if (burger && mnav) {
    burger.addEventListener('click', () => setMobile(burger.getAttribute('aria-expanded') !== 'true'));
    mnav.addEventListener('click', (e) => { if (e.target.closest('a')) setMobile(false); });
    window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setMobile(false); });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    items.forEach((item) => setOpen(item, false));
    if (burger && burger.getAttribute('aria-expanded') === 'true') { setMobile(false); burger.focus(); }
  });

  // ── 스크롤: 숨김/표시 + 진행 막대 ──
  let prev = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const menuOpen = items.some((i) => i.classList.contains('is-open')) || (burger && burger.getAttribute('aria-expanded') === 'true');
    if (!menuOpen) {
      if (y < 120) nav.classList.remove('is-hidden');
      else if (y > prev + 4) nav.classList.add('is-hidden');
      else if (y < prev - 4) nav.classList.remove('is-hidden');
    }
    prev = y;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.style.setProperty('--rn-progress', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));
  onScroll();
})();
