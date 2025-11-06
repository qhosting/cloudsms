/**
 * Script para crear una campaña de prueba con LabMobile
 * Uso: npx tsx scripts/create-test-campaign.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creando campaña de prueba...\n');

  try {
    // 1. Obtener la primera empresa con configuración de LabMobile
    const company = await prisma.company.findFirst({
      where: {
        labMobileConfig: {
          isNot: null
        }
      },
      include: {
        labMobileConfig: true,
        users: {
          where: { role: 'COMPANY_ADMIN' },
          take: 1
        }
      }
    });

    if (!company) {
      console.error('❌ No se encontró ninguna empresa con configuración de LabMobile');
      console.log('💡 Ejecuta primero: psql -d sms_cloudmx < scripts/setup-test-database.sql');
      process.exit(1);
    }

    console.log(`✅ Empresa encontrada: ${company.name} (ID: ${company.id})`);
    console.log(`   Configuración LabMobile:`);
    console.log(`   - Username: ${company.labMobileConfig?.username}`);
    console.log(`   - TPOA: ${company.labMobileConfig?.tpoa}`);
    console.log(`   - Modo prueba: ${company.labMobileConfig?.testMode ? 'SÍ' : 'NO'}\n`);

    // 2. Crear lista de contactos de prueba
    let contactList = await prisma.contactList.findFirst({
      where: {
        companyId: company.id,
        name: 'Contactos de Prueba LabMobile'
      }
    });

    if (!contactList) {
      contactList = await prisma.contactList.create({
        data: {
          companyId: company.id,
          name: 'Contactos de Prueba LabMobile',
          description: 'Lista creada automáticamente para pruebas de integración',
          totalContacts: 3,
          validContacts: 3,
          invalidContacts: 0,
          duplicateContacts: 0
        }
      });
      console.log(`✅ Lista de contactos creada: ${contactList.name}`);
    } else {
      console.log(`✅ Usando lista existente: ${contactList.name}`);
    }

    // 3. Crear contactos de prueba
    const testContacts = [
      { firstName: 'Juan', lastName: 'Pérez', phone: '+34600111222' },
      { firstName: 'María', lastName: 'González', phone: '+34600333444' },
      { firstName: 'Carlos', lastName: 'López', phone: '+34600555666' }
    ];

    for (const contact of testContacts) {
      const existing = await prisma.contact.findFirst({
        where: {
          listId: contactList.id,
          phone: contact.phone
        }
      });

      if (!existing) {
        await prisma.contact.create({
          data: {
            listId: contactList.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            phone: contact.phone,
            isValid: true
          }
        });
        console.log(`   ✓ Contacto agregado: ${contact.firstName} ${contact.lastName} (${contact.phone})`);
      }
    }

    // 4. Crear plantilla de mensaje
    let template = await prisma.messageTemplate.findFirst({
      where: {
        companyId: company.id,
        name: 'Plantilla de Prueba LabMobile'
      }
    });

    if (!template) {
      template = await prisma.messageTemplate.create({
        data: {
          companyId: company.id,
          name: 'Plantilla de Prueba LabMobile',
          content: 'Hola {firstName}, este es un mensaje de prueba desde SMS CloudMX. ¡Integración con LabMobile exitosa!',
          variables: ['firstName']
        }
      });
      console.log(`✅ Plantilla creada: ${template.name}\n`);
    } else {
      console.log(`✅ Usando plantilla existente: ${template.name}\n`);
    }

    // 5. Crear campaña de prueba
    const campaign = await prisma.campaign.create({
      data: {
        companyId: company.id,
        name: `Prueba LabMobile - ${new Date().toLocaleString('es-ES')}`,
        message: 'Hola {firstName}, este es un mensaje de prueba desde SMS CloudMX. ¡Integración con LabMobile exitosa!',
        contactListId: contactList.id,
        status: 'DRAFT',
        scheduledFor: null,
        totalRecipients: 3,
        sentCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        estimatedCost: 3 // 1 crédito por mensaje (3 mensajes)
      }
    });

    console.log(`✅ Campaña creada exitosamente:`);
    console.log(`   ID: ${campaign.id}`);
    console.log(`   Nombre: ${campaign.name}`);
    console.log(`   Estado: ${campaign.status}`);
    console.log(`   Destinatarios: ${campaign.totalRecipients}`);
    console.log(`   Costo estimado: ${campaign.estimatedCost} créditos\n`);

    console.log('📋 Próximos pasos:');
    console.log('   1. Inicia el servidor: npm run dev');
    console.log(`   2. Accede a: http://localhost:3000/dashboard/campaigns/${campaign.id}`);
    console.log('   3. Revisa la configuración de la campaña');
    console.log('   4. Haz clic en "Enviar campaña" para probar la integración\n');

    console.log('💡 Notas importantes:');
    console.log('   - La campaña está en modo TEST (no se enviarán SMS reales)');
    console.log('   - Los webhooks se registrarán en la tabla labmobile_webhook_logs');
    console.log('   - Revisa los logs del servidor para ver el proceso de envío\n');

  } catch (error) {
    console.error('❌ Error al crear campaña de prueba:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
