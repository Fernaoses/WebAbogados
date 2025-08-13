(async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Debes iniciar sesión para acceder a esta sección.');
    window.location.href = '/login';
    return;
  }
  try {
    const res = await fetch('/api/verify', { headers: { 'Authorization': 'Bearer ' + token } });
    const data = await res.json();
    if (!res.ok) throw new Error();
    const path = window.location.pathname;
    if ((path.includes('dashboard-admin') && data.rol !== 'admin') ||
        (path.includes('dashboard-abogado') && data.rol !== 'abogado')) {
      throw new Error();
    }
  } catch (err) {
    alert('Acceso no autorizado');
    window.location.href = '/login';
  }
})();

