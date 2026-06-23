// аналоговый чайный зин — лёгкий интерактив, без зависимостей
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  // reveal при скролле (с фолбэком — контент никогда не остаётся скрытым)
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  // сжатие шапки при скролле
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('shrunk', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // мобильное меню
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.textContent = open ? '✕' : '☰';
    });
  }

  // текущий год в подвале
  const y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
});
