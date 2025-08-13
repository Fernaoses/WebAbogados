function cerrarSesion() {
  localStorage.removeItem('token');
  document.cookie = 'token=; Max-Age=0; Path=/';
  window.location.href = '/login';
}

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', cerrarSesion);
  }
});
