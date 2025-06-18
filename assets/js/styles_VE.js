// Archivo: styles_VE.js
// Script para manejar las ventanas emergentes

// document.addEventListener('DOMContentLoaded', function() {
// Código de inicialización para las ventanas emergentes
const aboutItems    = document.querySelectorAll('.about-item'),
        modales       = document.querySelectorAll('.about-item');

const popupOverlay  = document.getElementById('popup-overlay'),
        popupContent  = document.getElementById('popup-content');

const popupBody     = document.querySelector('.popup-body'),
        popupClose    = document.querySelector('.popup-close'),
        modal         = document.querySelector('.modal'),
        modalContent  = modal.querySelector('.modal-content'),
        closeButton   = modal.querySelector('.close');


// Añadir evento de clic al botón de política de seguridad
document.getElementById("menu_politica_seguridad").addEventListener("click", function () {
  window.location.href = "politica_seguridad.html";
});

// Añadir evento de clic a cada elemento about-item
aboutItems.forEach(item => {
    item.addEventListener('click', function() {
        // Obtener contenido del hidden-content
        const hiddenContent = this.querySelector('.hidden-content').innerHTML;
        
        // Insertar contenido en el popup
        popupBody.innerHTML = hiddenContent;
        
        // Mostrar popup y overlay
        popupOverlay.style.display = 'block';
        popupContent.style.display = 'block';
        
        // Añadir clase para evitar scroll en el body
        document.body.style.overflow = 'hidden';
    });
});

// Cerrar popup al hacer clic en el botón de cerrar

    popupClose.addEventListener('click', closePopup);


// Cerrar popup al hacer clic en el overlay

    popupOverlay.addEventListener('click', closePopup);


// Función para cerrar popup
function closePopup() {
    popupOverlay.style.display = 'none';
    popupContent.style.display = 'none';
    
    // Restaurar scroll en el body
    document.body.style.overflow = 'auto';
};

modales.forEach(item => {
    item.addEventListener('click', () => {
    modalContent.innerHTML = item.innerHTML;
    modal.style.display = 'auto';
    });
});

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == modal) {
    modal.style.display = 'none';
    }
});

// Código para el botón de scroll hacia arriba

const scrollTopBtn = document.getElementById("scroll-top-btn");

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
        behavior: "smooth"
    });
});