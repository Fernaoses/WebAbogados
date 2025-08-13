async function login(event) {
  event.preventDefault();
  const usuario = document.getElementById('user').value.trim();
  const password = document.getElementById('pass').value.trim();
  const message = document.getElementById('message');
  message.textContent = '';

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error en el servidor');
    localStorage.setItem('token', data.token);
    switch (data.rol) {
      case 'admin':
        window.location.href = '/dashboard-admin';
        break;
      case 'abogado':
        window.location.href = '/dashboard-abogado';
        break;
      default:
        window.location.href = '/';
    }
  } catch (err) {
    message.textContent = err.message;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', login);
  }
});

async function verificarSesion() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  const res = await fetch('/api/verify', { headers: { 'Authorization': 'Bearer ' + token } });
  return res.ok;
}
