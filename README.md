# WebAbogados

## Inicio rápido

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia el servidor con Node:
   ```bash
   node server.js
   ```
   o utilizando el script de npm:
   ```bash
   npm start
   ```

Una vez iniciado, abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación. El servidor Express incluido en este repositorio es suficiente; no se necesita ningún otro servidor adicional.

## Detalles

El servidor se ejecuta por defecto en el puerto `3000`. Puedes cambiarlo estableciendo la variable de entorno `PORT` antes de iniciar la aplicación.

### Registro de usuarios

Los nuevos usuarios se crean siempre con el rol `cliente`; no es posible seleccionar un rol diferente durante el registro.

## Base de datos

Esta versión utiliza **PostgreSQL** para almacenar los usuarios. Para que el servidor funcione necesitas:

1. Tener una instancia de PostgreSQL accesible.
2. Definir la variable de entorno `DATABASE_URL` con la cadena de conexión completa
   (por ejemplo: `export DATABASE_URL="postgres://usuario:password@host:5432/mi_base"`).
   Si prefieres cargarla desde un archivo local, crea un fichero `.env` con esa clave y
   el servidor la leerá automáticamente mediante [`dotenv`](https://www.npmjs.com/package/dotenv).
3. El servidor creará automáticamente la tabla `usuarios` si no existe. El esquema es:
   ```sql
   CREATE TABLE IF NOT EXISTS usuarios (
     id SERIAL PRIMARY KEY,
     usuario TEXT UNIQUE NOT NULL,
     password TEXT NOT NULL,
     rol TEXT NOT NULL
   );
   ```

En entornos de producción donde el proveedor requiera SSL (como algunos planes gratuitos), deja `NODE_ENV=production` para habilitar una conexión segura.
