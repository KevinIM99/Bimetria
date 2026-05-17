# ID4FACE WhatsApp Service

## Instalar dependencias

npm install

## Ejecutar

npm run dev

## Endpoints

POST /start-verification

GET /result/:sessionId

## Variables de entorno

- `ID4FACE_AUTH_URL` - URL de autenticación de ID4FACE
- `ID4FACE_USER` - usuario para autenticación
- `ID4FACE_PASS` - contraseña para autenticación
- `BASE_URL` - URL pública donde corre este servicio (usada en callbacks)
- `ID4FACE_ENV` - entorno para el widget ID4FACE
- `CALLBACK_TOKEN` - token compartido para validar llamadas a `/callback`
