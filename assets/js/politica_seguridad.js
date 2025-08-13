document.addEventListener('DOMContentLoaded', () => {
  const inicioLink = document.getElementById('link_inicio');
  if (inicioLink) {
    inicioLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = '/#home';
    });
  }

  const nosotrosLink = document.getElementById('link_nosotros');
  if (nosotrosLink) {
    nosotrosLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = '/#about';
    });
  }

  const serviciosLink = document.getElementById('link_servicios');
  if (serviciosLink) {
    serviciosLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = '/#services';
    });
  }

  const correoLink = document.getElementById('link_correo');
  if (correoLink) {
    correoLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = '/formulario-contacto';
    });
  }

  const loginBtn = document.getElementById('login_btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = '/login';
    });
  }
});

