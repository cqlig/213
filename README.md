# 🎫 Sistema de Gestión de Entradas Manuales

Una aplicación web completa para gestionar entradas de eventos de forma manual. Permite crear tickets con códigos QR únicos, validarlos y canjearlos el día del evento.

## ✨ Características

- **Creación manual de entradas**: Ingresa datos del comprador y genera tickets únicos
- **Códigos QR únicos**: Cada ticket tiene un ID único representado en un código QR
- **Validación en tiempo real**: Escanea códigos QR desde imágenes o ingresa el ID del ticket para validarlo
- **Sistema de canje**: Marca tickets como "Canjeado" cuando se usan
- **Interfaz móvil**: Diseño responsive y moderno para usar desde celular el día del evento
- **Base de datos SQLite**: Almacenamiento local simple y eficiente
- **Descarga de tickets**: Genera imágenes de los tickets para imprimir
- **Filtros avanzados**: Filtra tickets por estado (válidos/canjeados)
- **Gestión de tickets**: Elimina tickets canjeados o no deseados
- **Mensajes informativos**: Retroalimentación clara en cada acción
- **Diseño moderno**: Interfaz glassmorphism con efectos visuales atractivos

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React.js con React Router
- **Backend**: Node.js con Express
- **Base de datos**: SQLite
- **QR Codes**: qrcode, qrcode.react y jsqr para escanear QR desde imágenes
- **Estilos**: CSS moderno con glassmorphism, gradientes y efectos visuales

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn

## 🚀 Instalación

1. **Clona o descarga el proyecto**
   ```bash
   cd entradas
   ```

2. **Instala todas las dependencias**
   ```bash
   npm run install-all
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abre tu navegador**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 Cómo Usar

### 1. Crear Entradas
- Ve a la página principal "Crear Entrada"
- Completa los datos del comprador (nombre obligatorio, correo opcional)
- Ingresa el nombre del evento
- Haz clic en "Crear Entrada"
- El sistema generará un ticket con código QR único
- Descarga el ticket como imagen para imprimir

### 2. Ver Todas las Entradas
- Ve a "Ver Entradas" para ver la lista completa
- **Buscar**: Encuentra entradas por nombre, evento, correo o ID
- **Filtrar**: Ve solo tickets válidos, canjeados o todos
- **Gestionar**: Ver detalles, descargar o eliminar tickets
- Cada entrada muestra: comprador, evento, estado y fecha

### 3. Validar/Canjear Entradas (Día del Evento)
- Ve a "Escanear Entrada"
- **Método 1**: Ingresa el ID del ticket manualmente
- **Método 2**: Sube una foto del código QR y el sistema lo escaneará automáticamente
- El sistema te dirá si es válido o ya fue canjeado
- Si es válido, puedes marcarlo como "Canjeado"

## 🗄️ Estructura de la Base de Datos

La aplicación usa SQLite con una tabla `tickets` que contiene:

- `id`: ID único del ticket (UUID)
- `buyer_name`: Nombre del comprador
- `buyer_email`: Correo electrónico (opcional)
- `event_name`: Nombre del evento
- `created_at`: Fecha y hora de creación
- `status`: Estado del ticket ("Válido" o "Canjeado")
- `qr_code`: Código QR generado

## 📁 Estructura del Proyecto

```
entradas/
├── package.json                 # Configuración principal
├── server/                      # Backend (Node.js/Express)
│   ├── package.json
│   └── index.js                # Servidor principal
├── client/                      # Frontend (React)
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js              # Componente principal
│       ├── index.js            # Punto de entrada
│       ├── index.css           # Estilos globales
│       └── components/         # Componentes React
│           ├── CreateTicket.js
│           ├── TicketList.js
│           ├── TicketScanner.js
│           └── TicketViewer.js
└── README.md
```

## 🔧 Scripts Disponibles

- `npm run dev`: Inicia tanto el servidor como el cliente en modo desarrollo
- `npm run server`: Solo inicia el servidor backend
- `npm run client`: Solo inicia el cliente React
- `npm run build`: Construye la aplicación para producción
- `npm run install-all`: Instala todas las dependencias

## 🌐 API Endpoints

### Crear Ticket
```
POST /api/tickets
Body: { buyer_name, buyer_email?, event_name }
```

### Obtener Todos los Tickets
```
GET /api/tickets
```

### Obtener Ticket por ID
```
GET /api/tickets/:id
```

### Validar Ticket
```
POST /api/tickets/validate
Body: { ticket_id }
```

### Canjear Ticket
```
POST /api/tickets/redeem
Body: { ticket_id }
```

## 📱 Uso en Móvil

La aplicación está optimizada para uso móvil:

- Interfaz responsive que se adapta a pantallas pequeñas
- Botones grandes y fáciles de tocar
- Navegación simple entre secciones
- Validación rápida de tickets el día del evento

## 🔒 Seguridad

- Cada ticket tiene un ID único (UUID) que es prácticamente imposible de duplicar
- Los códigos QR contienen solo el ID del ticket
- No se almacenan datos sensibles
- La base de datos es local (SQLite)

## 🚀 Despliegue

Para desplegar en producción:

1. Construye el frontend:
   ```bash
   cd client
   npm run build
   ```

2. El servidor Express ya está configurado para servir los archivos estáticos del build

3. Puedes usar PM2 o similar para mantener el servidor corriendo:
   ```bash
   npm install -g pm2
   pm2 start server/index.js
   ```

## 🤝 Contribuciones

Si quieres mejorar el proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Haz tus cambios
4. Envía un pull request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**Desarrollado con ❤️ por Octavio Morales**

**¡Disfruta gestionando tus eventos de forma eficiente! 🎉** "# 1" 
"# 213" 
