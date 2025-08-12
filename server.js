const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('./utils/bcrypt');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const sessions = {}; // token -> {usuario, rol, exp}

function readUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
  catch { return []; }
}

function writeUsers(users) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function createToken() {
  return crypto.randomBytes(30).toString('hex');
}

app.post('/api/register', (req, res) => {
  try {
    const { usuario, password, rol } = req.body;
    if (!usuario || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }
    const users = readUsers();
    if (users.find(u => u.usuario === usuario)) {
      return res.status(409).json({ message: 'Usuario ya existe' });
    }
    const hashed = bcrypt.hash(password);
    users.push({ usuario, password: hashed, rol: rol || 'cliente' });
    writeUsers(users);
    return res.status(201).json({ message: 'Registro exitoso' });
  } catch (err) {
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { usuario, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.usuario === usuario);
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback para archivos estáticos inexistentes
app.use((req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  const known = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];
  if (ext && known.includes(ext)) {
    return res.redirect('/index.html');
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
