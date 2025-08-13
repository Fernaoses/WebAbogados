const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('./utils/bcrypt');
const Datastore = require('@seald-io/nedb');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const dbFile = path.join(__dirname, 'data', 'users.db');
fs.mkdirSync(path.dirname(dbFile), { recursive: true });
const db = new Datastore({ filename: dbFile, autoload: true });
db.ensureIndex({ fieldName: 'usuario', unique: true });

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

app.post('/api/register', (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
  }
  db.findOne({ usuario }, (err, existing) => {
    if (err) {
      return res.status(500).json({ message: 'Error en el servidor' });
    }
    if (existing) {
      return res.status(409).json({ message: 'Usuario ya existe' });
    }
    const hashed = bcrypt.hash(password);
    db.insert({ usuario, password: hashed, rol: 'cliente' }, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error en el servidor' });
      }
      return res.status(201).json({ message: 'Registro exitoso' });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { usuario, password } = req.body;
  db.findOne({ usuario }, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Error en el servidor' });
    }
    if (!user || !bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    const token = createToken();
    sessions[token] = { usuario: user.usuario, rol: user.rol, exp: Date.now() + 3600 * 1000 };
    return res.status(200).json({ token, rol: user.rol });
  });
});

app.get('/api/verify', (req, res) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.split(' ')[1];
  if (token && sessions[token] && sessions[token].exp > Date.now()) {
    return res.status(200).json({ usuario: sessions[token].usuario, rol: sessions[token].rol });
  }
  return res.status(401).json({ message: 'Token inválido' });
});

app.get('/api/users', requireRole('admin', 'super_admin'), (req, res) => {
  db.find({}, { password: 0 }, (err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Error en el servidor' });
    }
    return res.status(200).json(users);
  });
});

app.post('/api/users', requireRole('admin', 'super_admin'), (req, res) => {
  const { usuario, password, rol } = req.body;
  const allowed = ['super_admin', 'admin', 'abogado', 'cliente'];
  if (!usuario || !password || !allowed.includes(rol)) {
    return res.status(400).json({ message: 'Datos inválidos' });
  }
  if (req.session.rol === 'admin' && (rol === 'admin' || rol === 'super_admin')) {
    return res.status(403).json({ message: 'No autorizado' });
  }
  const hashed = bcrypt.hash(password);
  db.insert({ usuario, password: hashed, rol }, (err) => {
    if (err) {
      if (err.errorType === 'uniqueViolated') {
        return res.status(409).json({ message: 'Usuario ya existe' });
      }
      return res.status(500).json({ message: 'Error en el servidor' });
    }
    return res.status(201).json({ message: 'Usuario creado' });
  });
});

app.post('/api/users/:id/role', requireRole('admin', 'super_admin'), (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;
  const allowed = ['super_admin', 'admin', 'abogado', 'cliente'];
  if (!allowed.includes(rol)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }
  db.findOne({ _id: id }, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Error en el servidor' });
    }
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const requester = req.session.rol;
    if (requester === 'admin') {
      if (user.rol === 'admin' || user.rol === 'super_admin' || rol === 'admin' || rol === 'super_admin') {
        return res.status(403).json({ message: 'No autorizado' });
      }
    }
    db.update({ _id: id }, { $set: { rol } }, {}, (err, num) => {
      if (err) {
        return res.status(500).json({ message: 'Error en el servidor' });
      }
      if (num === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      return res.status(200).json({ message: 'Rol actualizado' });
    });
  });
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
