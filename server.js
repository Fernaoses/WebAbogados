const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('./utils/bcrypt');

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

function send(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

function notFound(res) {
  res.writeHead(404);
  res.end('Not found');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch(err) { reject(err); }
    });
  });
}

function createToken() {
  return crypto.randomBytes(30).toString('hex');
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'POST' && parsedUrl.pathname === '/api/register') {
    try {
      const { usuario, password, rol } = await parseBody(req);
      if (!usuario || !password) return send(res, 400, { message: 'Usuario y contraseña requeridos' });
      const users = readUsers();
      if (users.find(u => u.usuario === usuario)) return send(res, 409, { message: 'Usuario ya existe' });
      const hashed = bcrypt.hash(password);
      users.push({ usuario, password: hashed, rol: rol || 'cliente' });
      writeUsers(users);
      return send(res, 201, { message: 'Registro exitoso' });
    } catch (err) {
      return send(res, 500, { message: 'Error en el servidor' });
    }
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/login') {
    try {
      const { usuario, password } = await parseBody(req);
      const users = readUsers();
      const user = users.find(u => u.usuario === usuario);
      if (!user || !bcrypt.compare(password, user.password)) {
        return send(res, 401, { message: 'Credenciales incorrectas' });
      }
      const token = createToken();
      sessions[token] = { usuario: user.usuario, rol: user.rol, exp: Date.now() + 3600 * 1000 };
      return send(res, 200, { token, rol: user.rol });
    } catch (err) {
      return send(res, 500, { message: 'Error en el servidor' });
    }
  }

  if (req.method === 'GET' && parsedUrl.pathname === '/api/verify') {
    const auth = req.headers['authorization'] || '';
    const token = auth.split(' ')[1];
    if (token && sessions[token] && sessions[token].exp > Date.now()) {
      return send(res, 200, { usuario: sessions[token].usuario, rol: sessions[token].rol });
    }
    return send(res, 401, { message: 'Token inválido' });
  }

  notFound(res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
