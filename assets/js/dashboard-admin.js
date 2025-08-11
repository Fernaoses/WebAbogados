document.addEventListener('DOMContentLoaded', () => {
  const addUserBtn = document.getElementById('add-user-btn');
  const modal = document.getElementById('add-user-modal');
  const closeModal = modal ? modal.querySelector('.close-modal') : null;

  if (addUserBtn && modal && closeModal) {
    addUserBtn.addEventListener('click', () => {
      modal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    window.addEventListener('click', event => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
});

