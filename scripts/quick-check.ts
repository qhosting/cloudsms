/**
 * Script de verificación rápida de integración LabMobile
 * No requiere base de datos - solo verifica archivos
 * Uso: npx tsx scripts/quick-check.ts
 */

import fs from 'fs';
import path from 'path';

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, condition: boolean, passMsg: string, failMsg: string) {
  results.push({
    name,
    passed: condition,
    message: condition ? passMsg : failMsg
  });
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function fileContains(filePath: string, searchString: string): boolean {
  if (!fileExists(filePath)) return false;
  const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');
  return content.includes(searchString);
}

console.log('🔍 Verificación Rápida de Integración LabMobile\n');

// 1. Verificar archivos core de integración
console.log('📁 Verificando archivos core...');
check(
  'LabMobile Client',
  fileExists('lib/labmobile.ts'),
  '✅ lib/labmobile.ts encontrado',
  '❌ lib/labmobile.ts NO encontrado'
);

check(
  'SMS Sender',
  fileExists('lib/sms-sender.ts'),
  '✅ lib/sms-sender.ts encontrado',
  '❌ lib/sms-sender.ts NO encontrado'
);

check(
  'Webhook Endpoint',
  fileExists('app/api/webhooks/labmobile/delivery/route.ts'),
  '✅ Webhook endpoint encontrado',
  '❌ Webhook endpoint NO encontrado'
);

// 2. Verificar componentes UI
console.log('\n🎨 Verificando componentes UI...');
check(
  'Character Counter',
  fileExists('components/sms-advanced/sms-character-counter.tsx'),
  '✅ SMSCharacterCounter encontrado',
  '❌ SMSCharacterCounter NO encontrado'
);

check(
  'Preview Panel',
  fileExists('components/sms-advanced/sms-preview-panel.tsx'),
  '✅ SMSPreviewPanel encontrado',
  '❌ SMSPreviewPanel NO encontrado'
);

check(
  'Alert System',
  fileExists('components/sms-advanced/sms-alert-system.tsx'),
  '✅ SMSAlertSystem encontrado',
  '❌ SMSAlertSystem NO encontrado'
);

// 3. Verificar archivos de migración
console.log('\n🗄️  Verificando archivos de migración...');
check(
  'Migration SQL',
  fileExists('prisma/migrations/add_labmobile_support.sql'),
  '✅ Migración SQL encontrada',
  '❌ Migración SQL NO encontrada'
);

check(
  'Setup Script',
  fileExists('scripts/setup-test-database.sql'),
  '✅ Script de setup encontrado',
  '❌ Script de setup NO encontrado'
);

// 4. Verificar actualización del schema
console.log('\n📋 Verificando Prisma schema...');
check(
  'LabMobileConfig Model',
  fileContains('prisma/schema.prisma', 'model LabMobileConfig'),
  '✅ LabMobileConfig model definido',
  '❌ LabMobileConfig model NO definido'
);

check(
  'LabMobileWebhookLog Model',
  fileContains('prisma/schema.prisma', 'model LabMobileWebhookLog'),
  '✅ LabMobileWebhookLog model definido',
  '❌ LabMobileWebhookLog model NO definido'
);

// 5. Verificar integración en código existente
console.log('\n🔗 Verificando integración con código existente...');
check(
  'Send Route Updated',
  fileContains('app/api/dashboard/campaigns/[id]/send/route.ts', 'sendCampaignMessages') ||
  fileContains('app/api/dashboard/campaigns/[id]/send/route.ts', 'sms-sender'),
  '✅ Ruta de envío actualizada con integración real',
  '❌ Ruta de envío NO actualizada'
);

check(
  'Campaign Form Updated',
  fileContains('app/dashboard/campaigns/_components/campaign-creation-form.tsx', 'sms-advanced') ||
  fileContains('app/dashboard/campaigns/_components/campaign-creation-form.tsx', 'SMSCharacterCounter'),
  '✅ Formulario de campaña actualizado',
  '❌ Formulario de campaña NO actualizado'
);

// 6. Verificar documentación
console.log('\n📚 Verificando documentación...');
check(
  'Integration Docs',
  fileExists('LABMOBILE_INTEGRATION.md'),
  '✅ LABMOBILE_INTEGRATION.md encontrado',
  '⚠️  LABMOBILE_INTEGRATION.md NO encontrado (opcional)'
);

check(
  'Migration Guide',
  fileExists('MIGRATION_GUIDE.md'),
  '✅ MIGRATION_GUIDE.md encontrado',
  '⚠️  MIGRATION_GUIDE.md NO encontrado (opcional)'
);

check(
  'Testing Guide',
  fileExists('TESTING_GUIDE.md'),
  '✅ TESTING_GUIDE.md encontrado',
  '⚠️  TESTING_GUIDE.md NO encontrado (opcional)'
);

// 7. Verificar archivos de configuración
console.log('\n⚙️  Verificando configuración...');
check(
  '.env file',
  fileExists('.env'),
  '✅ Archivo .env encontrado',
  '⚠️  Archivo .env NO encontrado - copia .env.example'
);

check(
  'TypeScript Config',
  fileExists('tsconfig.json'),
  '✅ tsconfig.json encontrado',
  '❌ tsconfig.json NO encontrado'
);

// 8. Verificar dependencias
console.log('\n📦 Verificando estructura de proyecto...');
check(
  'Node Modules',
  fileExists('node_modules'),
  '✅ node_modules instalado',
  '❌ node_modules NO encontrado - ejecuta npm install'
);

check(
  'Package JSON',
  fileExists('package.json'),
  '✅ package.json encontrado',
  '❌ package.json NO encontrado'
);

// Resumen
console.log('\n' + '='.repeat(60));
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;
const total = results.length;

console.log(`\n📊 Resumen de Verificación:`);
console.log(`   Total de checks: ${total}`);
console.log(`   ✅ Pasados: ${passed}`);
console.log(`   ❌ Fallidos: ${failed}`);
console.log(`   📈 Tasa de éxito: ${Math.round((passed / total) * 100)}%\n`);

// Mostrar detalles de checks fallidos
const failedChecks = results.filter(r => !r.passed);
if (failedChecks.length > 0) {
  console.log('❌ Checks fallidos:');
  failedChecks.forEach(check => {
    console.log(`   - ${check.name}: ${check.message}`);
  });
  console.log('');
}

// Mostrar todos los resultados
console.log('📋 Detalles completos:\n');
results.forEach(result => {
  console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
  console.log(`   ${result.message}\n`);
});

// Conclusión
if (failed === 0) {
  console.log('✅ ¡VERIFICACIÓN EXITOSA! Todos los componentes están en su lugar.');
  console.log('\n🚀 Próximos pasos:');
  console.log('   1. Configura tu base de datos PostgreSQL');
  console.log('   2. Ejecuta: ./scripts/setup-complete.sh');
  console.log('   3. Inicia el servidor: npm run dev');
  console.log('   4. Accede a http://localhost:3000\n');
  process.exit(0);
} else {
  console.log('⚠️  VERIFICACIÓN INCOMPLETA. Algunos componentes faltan o no están configurados.');
  console.log('\n💡 Acciones sugeridas:');
  console.log('   1. Revisa los archivos faltantes marcados arriba');
  console.log('   2. Verifica que hayas ejecutado todos los pasos de instalación');
  console.log('   3. Consulta TESTING_GUIDE.md para más detalles\n');
  process.exit(1);
}
