// Archivo: styles_VE.js

document.addEventListener("DOMContentLoaded", () => {
  const aboutItems = document.querySelectorAll(".about-item");
  const modales = document.querySelectorAll(".about-item");

  const popupOverlay = document.getElementById("popup-overlay");
  const popupContent = document.getElementById("popup-content");
  const popupBody = document.querySelector(".popup-body");
  const popupClose = document.querySelector(".popup-close");

  const modal = document.querySelector(".modal");
  const modalContent = modal ? modal.querySelector(".modal-content") : null;
  const closeButton = modal ? modal.querySelector(".close") : null;

  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });
  }

  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      alert(`Buscando: ${searchInput.value}`);
    });
  }

  const menuPoliticaSeguridad = document.getElementById("menu_politica_seguridad");
  if (menuPoliticaSeguridad) {
    menuPoliticaSeguridad.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "/politica_seguridad";
    });
  }

  const loginBtn = document.getElementById("login_btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "/login";
    });
  }

  const linkCorreo = document.getElementById("link_correo");
  if (linkCorreo) {
    linkCorreo.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "/formulario-contacto";
    });
  }

  if (aboutItems.length && popupOverlay && popupContent && popupBody && popupClose) {
    aboutItems.forEach((item) => {
      item.addEventListener("click", function () {
        const hiddenContent = this.querySelector(".hidden-content").innerHTML;
        popupBody.innerHTML = hiddenContent;
        popupOverlay.style.display = "block";
        popupContent.style.display = "block";
        document.body.style.overflow = "hidden";
      });
    });

    const closePopup = () => {
      popupOverlay.style.display = "none";
      popupContent.style.display = "none";
      document.body.style.overflow = "auto";
    };

    popupClose.addEventListener("click", closePopup);
    popupOverlay.addEventListener("click", closePopup);
  }

  if (modales.length && modal && modalContent && closeButton) {
    modales.forEach((item) => {
      item.addEventListener("click", () => {
        modalContent.innerHTML = item.innerHTML;
        modal.style.display = "auto";
      });
    });

    closeButton.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  const scrollTopBtn = document.getElementById("scroll-top-btn");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add("show");
      } else {
        scrollTopBtn.classList.remove("show");
      }
    });

    scrollTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  const services = document.querySelectorAll(".service-item");
  const popup = document.getElementById("popup-lateral");
  const servicesSection = document.querySelector(".services-section");
  const popupCloseLateral = document.querySelector(".popup-close-lateral");

  if (services.length && popup && servicesSection && popupCloseLateral && popupContent) {
    services.forEach((service) => {
      service.addEventListener("click", () => {
        const title = service.querySelector("h3").innerHTML;
        const description = service.querySelector("p").innerHTML;
        popupContent.innerHTML = `<h3>${title}</h3><p>${description}</p>`;
        popup.classList.add("active");
        servicesSection.classList.add("move-left");
      });
    });

    popupCloseLateral.addEventListener("click", () => {
      popup.classList.remove("active");
      servicesSection.classList.remove("move-left");
    });
  }
});

