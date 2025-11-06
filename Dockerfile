# Dockerfile para SMS CloudMX
FROM node:18-alpine

# Configurar directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Configurar Next.js para standalone
ENV NEXT_OUTPUT_MODE=standalone
ENV NODE_ENV=production

# Compilar aplicación
RUN npm run build

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Cambiar propietario de archivos
RUN chown -R nextjs:nodejs /app

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando de inicio
CMD ["npm", "start"]