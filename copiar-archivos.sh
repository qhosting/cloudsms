#!/bin/bash

# Script para copiar archivos al repositorio limpio

SOURCE_DIR="/workspace/sms-cloudmx"
TARGET_DIR="/workspace/sms-cloudmx-clean"

echo "📁 Copiando archivos de $SOURCE_DIR a $TARGET_DIR"

# Copiar directorio app
if [ -d "$SOURCE_DIR/app" ]; then
    echo "✅ Copiando app/..."
    cp -r "$SOURCE_DIR/app" "$TARGET_DIR/"
else
    echo "❌ Directorio app/ no encontrado"
fi

# Copiar directorio components
if [ -d "$SOURCE_DIR/components" ]; then
    echo "✅ Copiando components/..."
    cp -r "$SOURCE_DIR/components" "$TARGET_DIR/"
else
    echo "❌ Directorio components/ no encontrado"
fi

# Copiar directorio prisma
if [ -d "$SOURCE_DIR/prisma" ]; then
    echo "✅ Copiando prisma/..."
    cp -r "$SOURCE_DIR/prisma" "$TARGET_DIR/"
else
    echo "❌ Directorio prisma/ no encontrado"
fi

# Copiar directorio scripts
if [ -d "$SOURCE_DIR/scripts" ]; then
    echo "✅ Copiando scripts/..."
    cp -r "$SOURCE_DIR/scripts" "$TARGET_DIR/"
else
    echo "❌ Directorio scripts/ no encontrado"
fi

# Copiar directorio hooks
if [ -d "$SOURCE_DIR/hooks" ]; then
    echo "✅ Copiando hooks/..."
    cp -r "$SOURCE_DIR/hooks" "$TARGET_DIR/"
else
    echo "❌ Directorio hooks/ no encontrado"
fi

# Copiar directorio types
if [ -d "$SOURCE_DIR/types" ]; then
    echo "✅ Copiando types/..."
    cp -r "$SOURCE_DIR/types" "$TARGET_DIR/"
else
    echo "❌ Directorio types/ no encontrado"
fi

# Crear directorio lib y copiar archivos específicos
mkdir -p "$TARGET_DIR/lib"
if [ -f "$SOURCE_DIR/lib/labmobile.ts" ]; then
    echo "✅ Copiando lib/labmobile.ts..."
    cp "$SOURCE_DIR/lib/labmobile.ts" "$TARGET_DIR/lib/"
fi
if [ -f "$SOURCE_DIR/lib/sms-sender.ts" ]; then
    echo "✅ Copiando lib/sms-sender.ts..."
    cp "$SOURCE_DIR/lib/sms-sender.ts" "$TARGET_DIR/lib/"
fi

# Copiar archivos de configuración del directorio raíz
for file in package.json tsconfig.json next.config.js tailwind.config.ts components.json middleware.ts; do
    if [ -f "$SOURCE_DIR/$file" ]; then
        echo "✅ Copiando $file..."
        cp "$SOURCE_DIR/$file" "$TARGET_DIR/"
    fi
done

# Copiar archivos de documentación
for file in *.md; do
    if [ -f "$SOURCE_DIR/$file" ]; then
        echo "✅ Copiando $file..."
        cp "$SOURCE_DIR/$file" "$TARGET_DIR/"
    fi
done

# Copiar archivos específicos
for file in .gitignore .env.example .yarnrc.yml; do
    if [ -f "$SOURCE_DIR/$file" ]; then
        echo "✅ Copiando $file..."
        cp "$SOURCE_DIR/$file" "$TARGET_DIR/"
    fi
done

echo "🎉 Copia completada!"

# Verificar que no hay archivos de node_modules
echo "🔍 Verificando que no hay node_modules..."
if find "$TARGET_DIR" -name "node_modules" -type d 2>/dev/null | grep -q .; then
    echo "⚠️  ADVERTENCIA: Se encontraron directorios node_modules!"
    find "$TARGET_DIR" -name "node_modules" -type d
else
    echo "✅ No se encontraron directorios node_modules"
fi

echo "📊 Tamaño del directorio: $(du -sh "$TARGET_DIR" | cut -f1)"
