document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const mainContent = document.getElementById('main-content');
  const menuPoliticaSeguridad = document.getElementById('menu_politica_seguridad');

  if (menuPoliticaSeguridad) {
    menuPoliticaSeguridad.addEventListener('click', function (event) {
      event.preventDefault();
      window.location.href = '/politica_seguridad';
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    mainContent.innerHTML = `
                <section id="confirmation">
                    <h2>¡Gracias por elegirnos!</h2>
                    <p>¿Qué sucede ahora?
Nuestro equipo de abogados ya está revisando tu solicitud. En breve nos pondremos en contacto contigo para brindarte más detalles y orientarte sobre los próximos pasos relacionados con tu caso.

Si tienes alguna otra consulta mientras tanto, no dudes en escribirnos nuevamente..</p>
                    <a href="/" class="button">Volver al Inicio</a>
                </section>
            `;
  });
});
