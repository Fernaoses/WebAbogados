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
    document.cookie = `token=${data.token}; Path=/`;
    switch (data.rol) {
      case 'super_admin':
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

  async function register(event) {
    event.preventDefault();
    const usuario = document.getElementById('newUser').value.trim();
    const password = document.getElementById('newPass').value.trim();
    const message = document.getElementById('registerMessage');
    message.textContent = '';
    message.classList.remove('text-danger', 'text-success');

  try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
      });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error en el servidor');
    message.classList.add('text-success');
    message.textContent = 'Registro exitoso. Ya puedes iniciar sesión.';
    document.getElementById('registerForm').reset();
    const collapse = bootstrap.Collapse.getInstance(document.getElementById('registerCollapse'));
    if (collapse) collapse.hide();
  } catch (err) {
    message.classList.add('text-danger');
    message.textContent = err.message;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const registerCollapse = document.getElementById('registerCollapse');
  const loginTitle = document.getElementById('formTitle');
  const toggleLink = document.querySelector('.toggle-link');
  if (form) {
    form.addEventListener('submit', login);
  }
  if (registerForm) {
    registerForm.addEventListener('submit', register);
  }
  if (registerCollapse) {
    registerCollapse.addEventListener('show.bs.collapse', () => {
      if (form) form.style.display = 'none';
      if (loginTitle) loginTitle.textContent = 'Registro';
      if (toggleLink) toggleLink.textContent = '¿Ya tienes cuenta? Inicia sesión';
    });
    registerCollapse.addEventListener('hide.bs.collapse', () => {
      if (form) form.style.display = 'block';
      if (loginTitle) loginTitle.textContent = 'Iniciar Sesión';
      if (toggleLink) toggleLink.textContent = '¿No tienes cuenta? Regístrate';
    });
  }
});

async function verificarSesion() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  const res = await fetch('/api/verify', { headers: { 'Authorization': 'Bearer ' + token } });
  return res.ok;
}
