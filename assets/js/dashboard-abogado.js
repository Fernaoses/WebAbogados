function openModal() {
  document.getElementById('requestModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('requestModal').style.display = 'none';
}

window.addEventListener('click', function(event) {
  const modal = document.getElementById('requestModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  document.querySelectorAll('.change-status-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const statusBadge = row.querySelector('.status-badge');
      if (statusBadge.classList.contains('status-pending')) {
        statusBadge.textContent = 'En proceso';
        statusBadge.className = 'status-badge status-in-progress';
      } else if (statusBadge.classList.contains('status-in-progress')) {
        statusBadge.textContent = 'Resuelto';
        statusBadge.className = 'status-badge status-resolved';
      } else {
        statusBadge.textContent = 'Pendiente';
        statusBadge.className = 'status-badge status-pending';
      }
    });
  });
});
