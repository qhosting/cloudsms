
# 📱 SMS CloudMX Platform

> **Plataforma SaaS Completa para Campañas de Marketing SMS con Integración Real de LabMobile**

## 🚀 **NUEVA FUNCIONALIDAD: Integración Real con LabMobile**

**¡Ya no es simulación!** Esta versión incluye integración completa y funcional con la API de LabMobile para envío real de SMS.

## 🚀 Características Principales

### 📋 **Módulo de Listas de Contactos**
- ✅ Creación y gestión de listas personalizadas
- ✅ Segmentación automática de contactos
- ✅ Filtros avanzados por criterios múltiples
- ✅ Listas dinámicas con actualización automática
- ✅ Gestión de suscripciones y opt-out
- ✅ Importación masiva de contactos
- ✅ Estadísticas detalladas por lista

### 📤 **Módulo de Campañas SMS**
- ✅ Creación de campañas personalizadas
- ✅ **Integración real con LabMobile API** - ¡Envío de SMS reales!
- ✅ Programación de envíos
- ✅ **Sistema de plantillas avanzado** con validación de caracteres
- ✅ Vista previa antes del envío
- ✅ Seguimiento en tiempo real
- ✅ Estadísticas de entrega y respuesta
- ✅ Gestión de créditos SMS

### 🔗 **Integración LabMobile (NUEVO)**
- ✅ **Envío real de SMS** via API HTTP/POST JSON
- ✅ **Autenticación Basic Auth** (username:token)
- ✅ **Manejo de límites de caracteres** según especificación
- ✅ **Webhooks** para tracking de entrega
- ✅ **Modo de prueba** (no envía SMS reales para testing)
- ✅ **Manejo robusto de errores** con códigos específicos
- ✅ **Consulta de saldo** y precios por país

### 🎯 **Sistema de Plantillas Avanzado (NUEVO)**
- ✅ **Contador inteligente de caracteres** (GSM 7-bit: 160, Unicode: 70)
- ✅ **Detección automática de encoding** (GSM vs Unicode)
- ✅ **SMS concatenados** hasta 459 caracteres (3 partes)
- ✅ **Validación en tiempo real** con indicadores visuales
- ✅ **Panel de vista previa** dinámico con datos reales
- ✅ **Separación automática** de mensajes largos
- ✅ Alertas contextuales y recomendaciones

### 🎯 **Segmentación Avanzada**
- ✅ Filtrado por ubicación geográfica
- ✅ Segmentación por fecha de registro
- ✅ Filtros por actividad del usuario
- ✅ Criterios personalizados
- ✅ Combinación de múltiples filtros

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Next.js 14, React 18, TypeScript
- **Backend:** Next.js API Routes, Prisma ORM
- **Base de Datos:** PostgreSQL
- **Autenticación:** NextAuth.js
- **UI:** Tailwind CSS, Radix UI, Shadcn/ui
- **Estado:** Zustand, React Query
- **Formularios:** React Hook Form + Zod
- **Notificaciones:** React Hot Toast

## 🚀 Instalación Rápida

### Opción 1: Configuración Automática (Recomendada)

```bash
# Clonar el repositorio
git clone https://github.com/qhosting/cloudsms.git
cd cloudsms

# Configuración automática completa
chmod +x scripts/setup-complete.sh
./scripts/setup-complete.sh

# Iniciar servidor
npm run dev

# Acceder a http://localhost:3000
```

### Opción 2: Instalación Manual

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar base de datos
# Editar .env con tus credenciales de PostgreSQL
cp .env.example .env

# 3. Aplicar migraciones
npx prisma generate
npx prisma db push

# 4. Configurar datos de prueba
npm run db:seed

# 5. Iniciar desarrollo
npm run dev
```

## 🔧 Configuración LabMobile

### Variables de Entorno Requeridas

```bash
# LabMobile API
LABMOBILE_USERNAME="tu-email@labsmobile.com"
LABMOBILE_TOKEN="tu-token-api"
LABMOBILE_TPOA="TuEmpresa"
LABMOBILE_WEBHOOK_URL="https://tu-dominio.com/api/webhooks/labmobile/delivery"
LABMOBILE_TEST_MODE="true"  # Cambiar a "false" para envío real
```

### Credenciales de Prueba Configuradas

```
LabMobile:
  Username: test@example.com
  Token: test_token_123
  TPOA: TestCompany
  Modo Test: true (NO envía SMS reales)

Empresa de Prueba:
  Créditos: 1000
  Campaña: 3 contactos de prueba
```

## 🏗️ Estructura del Proyecto

```
├── app/
│   ├── api/
│   │   ├── dashboard/
│   │   │   ├── campaigns/      # APIs de campañas
│   │   │   └── lists/          # APIs de listas
│   │   └── webhooks/
│   │       └── labmobile/      # Webhooks LabMobile (NUEVO)
│   ├── dashboard/
│   │   ├── campaigns/          # Módulo de campañas
│   │   └── _components/        # Componentes SMS avanzados (NUEVO)
│   └── super-admin/            # Panel de administración
├── components/
│   ├── ui/                     # Componentes base
│   └── sms-advanced/           # Componentes SMS avanzados (NUEVO)
│       ├── sms-character-counter.tsx
│       ├── sms-preview-panel.tsx
│       └── sms-alert-system.tsx
├── lib/
│   ├── labmobile.ts            # Cliente LabMobile (NUEVO)
│   ├── sms-sender.ts           # Lógica de envío (NUEVO)
│   └── prisma.ts               # Configuración Prisma
├── prisma/
│   ├── schema.prisma           # Esquema de BD (actualizado)
│   └── migrations/             # Migraciones
├── scripts/                    # Scripts de configuración (NUEVO)
│   ├── setup-complete.sh
│   ├── setup-test-database.sql
│   └── validate-integration.sh
└── docs/                       # Documentación completa (NUEVO)
```

## 📋 Scripts Disponibles

### Configuración y Testing
- `./scripts/setup-complete.sh` - Configuración automática completa
- `./scripts/setup-test-database.sql` - Script SQL para datos de prueba
- `./scripts/create-test-campaign.ts` - Crear campaña de prueba
- `./scripts/validate-integration.sh` - Validar integración
- `./scripts/quick-check.ts` - Verificación rápida

### Desarrollo
- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Iniciar servidor de producción
- `npx prisma studio` - Abrir Prisma Studio

## 📊 Base de Datos

### Modelos Principales
- `User`: Usuarios del sistema
- `Contact`: Contactos individuales
- `ContactList`: Listas de contactos
- `Campaign`: Campañas de SMS
- `Message`: Mensajes individuales enviados

### Relaciones
- Un usuario puede tener múltiples listas y campañas
- Una lista puede contener múltiples contactos
- Una campaña puede enviar mensajes a múltiples contactos
- Soporte para suscripciones y opt-out por lista

## 🔧 APIs Disponibles

### Listas de Contactos
- `GET /api/dashboard/lists` - Obtener todas las listas
- `POST /api/dashboard/lists` - Crear nueva lista
- `GET /api/dashboard/lists/[id]` - Obtener lista específica
- `PUT /api/dashboard/lists/[id]` - Actualizar lista
- `DELETE /api/dashboard/lists/[id]` - Eliminar lista
- `POST /api/dashboard/lists/[id]/contacts` - Gestionar contactos de la lista
- `POST /api/dashboard/lists/segment` - Aplicar segmentación

### Campañas
- `GET /api/dashboard/campaigns` - Obtener todas las campañas
- `POST /api/dashboard/campaigns` - Crear nueva campaña
- `GET /api/dashboard/campaigns/[id]` - Obtener campaña específica
- `PUT /api/dashboard/campaigns/[id]` - Actualizar campaña
- `POST /api/dashboard/campaigns/[id]/send` - Enviar campaña

## 🎨 Componentes UI

La aplicación utiliza un sistema de componentes reutilizables basado en:
- **Shadcn/ui**: Componentes base accesibles
- **Radix UI**: Primitivos de UI
- **Tailwind CSS**: Estilos utilitarios
- **Lucide React**: Iconos

### Componentes Principales
- `ListsTable`: Tabla de listas con filtros y acciones
- `ListCreationForm`: Formulario de creación de listas
- `CampaignForm`: Formulario de creación de campañas
- `StatsCards`: Tarjetas de estadísticas
- `ContactsManager`: Gestor de contactos

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Docker
```bash
# Construir imagen
docker build -t sms-cloudmx .

# Ejecutar contenedor
docker run -p 3000:3000 sms-cloudmx
```

## 🔒 Seguridad

- ✅ Autenticación con NextAuth.js
- ✅ Validación de datos con Zod
- ✅ Sanitización de entradas
- ✅ Protección CSRF
- ✅ Headers de seguridad configurados
- ✅ Variables de entorno para credenciales

## 📈 Funcionalidades Avanzadas

### Segmentación Inteligente
- Filtros dinámicos por múltiples criterios
- Combinación lógica de condiciones (AND/OR)
- Previsualización de segmentos antes de aplicar
- Guardado de criterios de segmentación

### Gestión de Suscripciones
- Sistema completo de opt-in/opt-out
- Respeto a preferencias de contacto
- Historial de cambios de suscripción
- Compliance con regulaciones de marketing

### Analytics y Reportes
- Métricas detalladas por campaña y lista
- Tasas de entrega, apertura y respuesta
- Gráficos interactivos de rendimiento
- Exportación de reportes

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- 📧 Email: soporte@smscloudmx.com
- 📱 WhatsApp: +1 (555) 123-4567
- 💬 Discord: [SMS CloudMX Community](https://discord.gg/smscloudmx)

## 🗺️ Roadmap

### ✅ **Funcionalidades Implementadas**
- [x] **Integración con múltiples proveedores SMS** (LabMobile implementado)
- [x] **Sistema de plantillas avanzado** (con validación de caracteres)
- [x] **API REST completa para integraciones** (completamente funcional)
- [x] **Dashboard de analytics avanzado** (estadísticas en tiempo real)
- [x] **Sistema de webhooks** (tracking de entrega LabMobile)

### 🚧 **Próximas Funcionalidades**
- [ ] Soporte para MMS y RCS
- [ ] Integración con CRM externos
- [ ] Aplicación móvil

## 📚 **Documentación Completa**

### Guías Principales
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Guía completa de pruebas y configuración
- **[LABMOBILE_INTEGRATION.md](./LABMOBILE_INTEGRATION.md)** - Documentación técnica de LabMobile
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Migración a producción

### Documentación del Sistema Original
- **[API-REFERENCE.md](./API-REFERENCE.md)** - Referencia completa de APIs
- **[DEVELOPMENT-REFERENCE.md](./DEVELOPMENT-REFERENCE.md)** - Guía de desarrollo
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía de despliegue

## 🧪 **Testing y Validación**

### Verificación Rápida
```bash
# Verificar que todo está instalado correctamente
npx tsx scripts/quick-check.ts
```

### Validación Completa
```bash
# Validación completa (requiere base de datos)
./scripts/validate-integration.sh
```

### Testing de LabMobile
1. Configurar credenciales de prueba en `.env`
2. Ejecutar `./scripts/setup-complete.sh`
3. Crear campaña de prueba desde la UI
4. Verificar que no se envían SMS reales (modo test)
5. Revisar logs para confirmar integración

---

## 🎉 **¡Gracias por usar SMS CloudMX!**

Esta plataforma está diseñada para ser **fácil de usar** y **completamente funcional** desde el primer día. Con la integración real de LabMobile, puedes comenzar a enviar campañas SMS inmediatamente.

### **Características Destacadas:**
✅ **Envío real de SMS** via LabMobile  
✅ **Sistema de plantillas avanzado** con validación  
✅ **Interfaz intuitiva** para campañas complejas  
✅ **Documentación completa** y scripts de configuración  
✅ **Modo de prueba** para testing seguro  

**¡Comienza a enviar tus primeras campañas SMS hoy mismo!**
