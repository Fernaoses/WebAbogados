require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('./utils/bcrypt');
const pool = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const initQuery = `
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  usuario TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  rol TEXT NOT NULL
)`;
pool.query(initQuery).catch(err => console.error('Error creando tabla', err));

const sessions = {}; // token -> {usuario, rol, exp}

function createToken() {
  return crypto.randomBytes(30).toString('hex');
}

function getToken(req) {
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer ')) {
    return auth.split(' ')[1];
  }
  const cookies = req.headers.cookie || '';
  const match = cookies.match(/token=([^;]+)/);
  return match ? match[1] : null;
}

function requireRole(...roles) {
  return (req, res, next) => {
    const token = getToken(req);
    const session = token && sessions[token];
    if (session && session.exp > Date.now() && roles.includes(session.rol)) {
      req.session = session;
      return next();
    }
    return res.status(401).json({ message: 'No autorizado' });
  };
}

app.post('/api/register', async (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
  }
  const hashed = bcrypt.hash(password);
  try {
    await pool.query(
      'INSERT INTO usuarios (usuario, password, rol) VALUES ($1, $2, $3)',
      [usuario, hashed, 'cliente']
    );
    return res.status(201).json({ message: 'Registro exitoso' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Usuario ya existe' });
    }
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.post('/api/login', async (req, res) => {
  const { usuario, password } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT usuario, password, rol FROM usuarios WHERE usuario = $1',
      [usuario]
    );
    const user = rows[0];
    if (!user || !bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    const token = createToken();
    sessions[token] = { usuario: user.usuario, rol: user.rol, exp: Date.now() + 3600 * 1000 };
    return res.status(200).json({ token, rol: user.rol });
  } catch (err) {
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.get('/api/verify', (req, res) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.split(' ')[1];
  if (token && sessions[token] && sessions[token].exp > Date.now()) {
    return res.status(200).json({ usuario: sessions[token].usuario, rol: sessions[token].rol });
  }
  return res.status(401).json({ message: 'Token inválido' });
});

app.get('/api/users', requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, usuario, rol FROM usuarios');
    const users = rows.map(u => ({ _id: u.id, usuario: u.usuario, rol: u.rol }));
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.post('/api/users', requireRole('admin', 'super_admin'), async (req, res) => {
  const { usuario, password, rol } = req.body;
  const allowed = ['super_admin', 'admin', 'abogado', 'cliente'];
  if (!usuario || !password || !allowed.includes(rol)) {
    return res.status(400).json({ message: 'Datos inválidos' });
  }
  if (req.session.rol === 'admin' && (rol === 'admin' || rol === 'super_admin')) {
    return res.status(403).json({ message: 'No autorizado' });
  }
  const hashed = bcrypt.hash(password);
  try {
    await pool.query(
      'INSERT INTO usuarios (usuario, password, rol) VALUES ($1, $2, $3)',
      [usuario, hashed, rol]
    );
    return res.status(201).json({ message: 'Usuario creado' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Usuario ya existe' });
    }
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.post('/api/users/:id/role', requireRole('admin', 'super_admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  const { rol } = req.body;
  const allowed = ['super_admin', 'admin', 'abogado', 'cliente'];
  if (!allowed.includes(rol)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }
  try {
    const { rows } = await pool.query('SELECT id, rol FROM usuarios WHERE id = $1', [id]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const requester = req.session.rol;
    if (requester === 'admin') {
      if (user.rol === 'admin' || user.rol === 'super_admin' || rol === 'admin' || rol === 'super_admin') {
        return res.status(403).json({ message: 'No autorizado' });
      }
    }
    const result = await pool.query('UPDATE usuarios SET rol = $1 WHERE id = $2', [rol, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    return res.status(200).json({ message: 'Rol actualizado' });
  } catch (err) {
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.get('/dashboard-admin', requireRole('admin', 'super_admin'), (req, res) => {
  return res.sendFile(path.join(__dirname, 'dashboard-admin.html'));
});

app.get('/dashboard-abogado', requireRole('abogado'), (req, res) => {
  return res.sendFile(path.join(__dirname, 'dashboard-abogado.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejo de rutas para páginas sin extensión y activos faltantes
app.use((req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  const assetExts = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];
  const base = ext ? req.path.slice(0, -ext.length) : req.path;
  const cleanBase = base.replace(/^\/+/,'');
  const htmlFile = path.join(__dirname, `${cleanBase || 'index'}.html`);

  if (ext === '.html') {
    return res.redirect(base || '/');
  }

  if (!ext || !assetExts.includes(ext)) {
    if (fs.existsSync(htmlFile)) {
      if (ext) {
        return res.redirect(base);
      }
      return res.sendFile(htmlFile);
    }
  }

  if (ext && assetExts.includes(ext)) {
    return res.redirect('/index');
  }

  next();
});

// 404 para rutas claramente inexistentes
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
