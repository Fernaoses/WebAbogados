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
