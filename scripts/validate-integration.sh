#!/bin/bash

# Script de validación de integración LabMobile
# Verifica que todos los componentes estén correctamente instalados y configurados

set -e

echo "🔍 Validando integración LabMobile en SMS CloudMX..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Función para checks
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# 1. Verificar archivos críticos
echo "📁 Verificando archivos de integración..."
if [ -f "lib/labmobile.ts" ]; then
    check_pass "lib/labmobile.ts encontrado"
else
    check_fail "lib/labmobile.ts NO encontrado"
fi

if [ -f "lib/sms-sender.ts" ]; then
    check_pass "lib/sms-sender.ts encontrado"
else
    check_fail "lib/sms-sender.ts NO encontrado"
fi

if [ -f "app/api/webhooks/labmobile/delivery/route.ts" ]; then
    check_pass "Webhook endpoint encontrado"
else
    check_fail "Webhook endpoint NO encontrado"
fi

if [ -f "prisma/migrations/add_labmobile_support.sql" ]; then
    check_pass "Migración SQL encontrada"
else
    check_fail "Migración SQL NO encontrada"
fi
echo ""

# 2. Verificar componentes UI
echo "🎨 Verificando componentes UI avanzados..."
if [ -f "components/sms-advanced/sms-character-counter.tsx" ]; then
    check_pass "SMSCharacterCounter.tsx encontrado"
else
    check_fail "SMSCharacterCounter.tsx NO encontrado"
fi

if [ -f "components/sms-advanced/sms-preview-panel.tsx" ]; then
    check_pass "SMSPreviewPanel.tsx encontrado"
else
    check_fail "SMSPreviewPanel.tsx NO encontrado"
fi

if [ -f "components/sms-advanced/sms-alert-system.tsx" ]; then
    check_pass "SMSAlertSystem.tsx encontrado"
else
    check_fail "SMSAlertSystem.tsx NO encontrado"
fi
echo ""

# 3. Verificar configuración de entorno
echo "⚙️  Verificando variables de entorno..."
if [ -f ".env" ]; then
    check_pass "Archivo .env encontrado"
    
    source .env
    
    if [ ! -z "$DATABASE_URL" ]; then
        check_pass "DATABASE_URL configurado"
    else
        check_fail "DATABASE_URL NO configurado"
    fi
    
    if [ ! -z "$LABMOBILE_USERNAME" ]; then
        check_pass "LABMOBILE_USERNAME configurado"
    else
        check_warn "LABMOBILE_USERNAME NO configurado (opcional si está en BD)"
    fi
    
    if [ ! -z "$LABMOBILE_TOKEN" ]; then
        check_pass "LABMOBILE_TOKEN configurado"
    else
        check_warn "LABMOBILE_TOKEN NO configurado (opcional si está en BD)"
    fi
else
    check_fail "Archivo .env NO encontrado"
fi
echo ""

# 4. Verificar base de datos
echo "🗄️  Verificando estructura de base de datos..."
if command -v psql &> /dev/null && [ ! -z "$DATABASE_URL" ]; then
    # Verificar tabla labmobile_config
    if psql "$DATABASE_URL" -c "SELECT 1 FROM labmobile_config LIMIT 1;" &> /dev/null; then
        check_pass "Tabla labmobile_config existe"
    else
        check_fail "Tabla labmobile_config NO existe - ejecuta la migración"
    fi
    
    # Verificar tabla labmobile_webhook_logs
    if psql "$DATABASE_URL" -c "SELECT 1 FROM labmobile_webhook_logs LIMIT 1;" &> /dev/null; then
        check_pass "Tabla labmobile_webhook_logs existe"
    else
        check_fail "Tabla labmobile_webhook_logs NO existe - ejecuta la migración"
    fi
    
    # Verificar campos nuevos en messages
    if psql "$DATABASE_URL" -c "SELECT labmobile_sub_id FROM messages LIMIT 1;" &> /dev/null; then
        check_pass "Campos LabMobile agregados a tabla messages"
    else
        check_fail "Campos LabMobile NO agregados a tabla messages - ejecuta la migración"
    fi
    
    # Verificar si hay configuración de LabMobile
    CONFIG_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM labmobile_config;" 2>/dev/null | xargs)
    if [ "$CONFIG_COUNT" -gt "0" ]; then
        check_pass "Configuración de LabMobile encontrada ($CONFIG_COUNT empresas)"
    else
        check_warn "No hay configuración de LabMobile - ejecuta setup-test-database.sql"
    fi
else
    check_warn "No se pudo verificar base de datos (psql no disponible o DATABASE_URL no configurado)"
fi
echo ""

# 5. Verificar dependencias de Node
echo "📦 Verificando dependencias..."
if [ -f "package.json" ]; then
    check_pass "package.json encontrado"
    
    if [ -d "node_modules" ]; then
        check_pass "node_modules instalado"
    else
        check_fail "node_modules NO encontrado - ejecuta npm install"
    fi
    
    # Verificar Prisma Client
    if [ -d "node_modules/.prisma/client" ] || [ -d "node_modules/@prisma/client" ]; then
        check_pass "Prisma Client generado"
    else
        check_warn "Prisma Client podría no estar generado - ejecuta npx prisma generate"
    fi
else
    check_fail "package.json NO encontrado"
fi
echo ""

# 6. Verificar compilación TypeScript
echo "🔧 Verificando compilación TypeScript..."
if command -v tsc &> /dev/null || [ -f "node_modules/.bin/tsc" ]; then
    if npx tsc --noEmit &> /tmp/tsc-errors.log; then
        check_pass "Código TypeScript compila sin errores"
    else
        check_warn "Hay errores de TypeScript - revisa /tmp/tsc-errors.log"
        # Mostrar primeras líneas de error
        head -n 10 /tmp/tsc-errors.log
    fi
else
    check_warn "TypeScript no está disponible"
fi
echo ""

# 7. Verificar documentación
echo "📚 Verificando documentación..."
if [ -f "LABMOBILE_INTEGRATION.md" ]; then
    check_pass "LABMOBILE_INTEGRATION.md encontrado"
else
    check_warn "LABMOBILE_INTEGRATION.md NO encontrado"
fi

if [ -f "MIGRATION_GUIDE.md" ]; then
    check_pass "MIGRATION_GUIDE.md encontrado"
else
    check_warn "MIGRATION_GUIDE.md NO encontrado"
fi
echo ""

# Resumen final
echo "================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ VALIDACIÓN COMPLETADA - TODO OK${NC}"
    echo "   La integración está correctamente instalada"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  VALIDACIÓN COMPLETADA CON ADVERTENCIAS${NC}"
    echo "   Errores: 0"
    echo "   Advertencias: $WARNINGS"
else
    echo -e "${RED}❌ VALIDACIÓN FALLIDA${NC}"
    echo "   Errores: $ERRORS"
    echo "   Advertencias: $WARNINGS"
fi
echo "================================"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "💡 Acciones requeridas:"
    echo "   1. Revisa los errores marcados arriba"
    echo "   2. Ejecuta: ./scripts/setup-complete.sh"
    echo "   3. Vuelve a ejecutar esta validación"
    exit 1
fi

exit 0
