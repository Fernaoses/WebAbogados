document.addEventListener('DOMContentLoaded', () => {
  const typedTarget = document.querySelector('.logo');
  if (typedTarget && window.Typed) {
    new Typed('.logo', {
      strings: ['Gestión Legal PTY'],
      typeSpeed: 50
    });
  }
});

