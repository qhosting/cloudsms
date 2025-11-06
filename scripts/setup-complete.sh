#!/bin/bash

# Script de configuración completa para SMS CloudMX con LabMobile
# Ejecuta todos los pasos necesarios para configurar el entorno de prueba

set -e  # Detener en caso de error

echo "🚀 Iniciando configuración de SMS CloudMX con LabMobile..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Debes ejecutar este script desde el directorio raíz del proyecto${NC}"
    exit 1
fi

# Paso 1: Verificar archivo .env
echo -e "${YELLOW}📋 Paso 1: Verificando configuración de entorno...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ No se encontró archivo .env${NC}"
    echo "   Creando .env desde .env.example..."
    cp .env .env
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
else
    echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
fi
echo ""

# Paso 2: Verificar conexión a base de datos
echo -e "${YELLOW}📋 Paso 2: Verificando conexión a PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL no está instalado o no está en el PATH${NC}"
    echo "   Por favor instala PostgreSQL: https://www.postgresql.org/download/"
    exit 1
fi

# Leer DATABASE_URL del .env
source .env
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL no está configurado en .env${NC}"
    exit 1
fi

# Intentar conectar
if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
    echo -e "${GREEN}✅ Conexión a base de datos exitosa${NC}"
else
    echo -e "${RED}❌ No se pudo conectar a la base de datos${NC}"
    echo "   Verifica que PostgreSQL esté corriendo y que DATABASE_URL sea correcto"
    exit 1
fi
echo ""

# Paso 3: Aplicar migración de LabMobile
echo -e "${YELLOW}📋 Paso 3: Aplicando migración de LabMobile...${NC}"
if psql "$DATABASE_URL" -f prisma/migrations/add_labmobile_support.sql &> /dev/null; then
    echo -e "${GREEN}✅ Migración aplicada exitosamente${NC}"
else
    echo -e "${YELLOW}⚠️  La migración ya podría estar aplicada o hubo un error${NC}"
fi
echo ""

# Paso 4: Configurar datos de prueba
echo -e "${YELLOW}📋 Paso 4: Configurando empresa y credenciales de prueba...${NC}"
if psql "$DATABASE_URL" -f scripts/setup-test-database.sql; then
    echo -e "${GREEN}✅ Datos de prueba configurados${NC}"
else
    echo -e "${RED}❌ Error al configurar datos de prueba${NC}"
    exit 1
fi
echo ""

# Paso 5: Generar cliente de Prisma
echo -e "${YELLOW}📋 Paso 5: Generando cliente de Prisma...${NC}"
if npm run prisma:generate &> /dev/null || npx prisma generate &> /dev/null; then
    echo -e "${GREEN}✅ Cliente de Prisma generado${NC}"
else
    echo -e "${RED}❌ Error al generar cliente de Prisma${NC}"
    exit 1
fi
echo ""

# Paso 6: Crear campaña de prueba
echo -e "${YELLOW}📋 Paso 6: Creando campaña de prueba...${NC}"
if command -v tsx &> /dev/null; then
    npx tsx scripts/create-test-campaign.ts
elif command -v ts-node &> /dev/null; then
    npx ts-node scripts/create-test-campaign.ts
else
    echo -e "${YELLOW}⚠️  tsx/ts-node no está instalado${NC}"
    echo "   Instalando tsx..."
    npm install -D tsx
    npx tsx scripts/create-test-campaign.ts
fi
echo ""

# Resumen final
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ CONFIGURACIÓN COMPLETADA${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📝 Resumen de configuración:"
echo "   - Base de datos migrada con soporte LabMobile"
echo "   - Empresa de prueba creada/configurada"
echo "   - Credenciales LabMobile insertadas (modo TEST)"
echo "   - Campaña de prueba lista para enviar"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Inicia el servidor de desarrollo:"
echo "      npm run dev"
echo ""
echo "   2. Accede a la aplicación:"
echo "      http://localhost:3000"
echo ""
echo "   3. Navega a la sección de campañas y envía la campaña de prueba"
echo ""
echo "💡 Nota: El modo TEST está activado, por lo que no se enviarán SMS reales"
echo ""
