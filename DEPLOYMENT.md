# Despliegue en easypanel

## Configuración de Docker

Este proyecto incluye configuración Docker optimizada para easypanel:

### Archivos Docker incluidos:
- `Dockerfile`: Configuración principal de Docker
- `.dockerignore`: Optimización del build

### Características del Dockerfile:
- **Base**: Node.js 18 Alpine (imagen ligera)
- **Single-stage**: Build simplificado para mayor compatibilidad
- **Prisma incluido**: Generación automática de cliente
- **Usuario no-root**: Mejores prácticas de seguridad
- **Puerto 3000**: Expuesto para la aplicación

### Variables de entorno requeridas:
```env
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/database
NEXTAUTH_SECRET=tu_secreto_aqui
NEXTAUTH_URL=http://localhost:3000
PORT=3000
```

### Comandos de despliegue:
1. **Build local**: `docker build -t sms-cloudmx .`
2. **Ejecutar local**: `docker run -p 3000:3000 sms-cloudmx`

### Para easypanel:
1. El Dockerfile está en la raíz del repositorio
2. La plataforma detectará automáticamente el archivo
3. Use el archivo `.env.deployment` como referencia para variables

### Estructura del proyecto:
```
/
├── Dockerfile              # ← Archivo principal para Docker
├── .dockerignore          # ← Optimización del build
├── .env.deployment        # ← Variables de entorno
├── app/                   # Código de la aplicación Next.js
├── prisma/               # Esquemas y migraciones
└── ... (otros archivos)
```