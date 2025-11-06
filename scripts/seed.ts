
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (in development)
  await prisma.message.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.contactList.deleteMany({});
  await prisma.creditTransaction.deleteMany({});
  await prisma.adminLog.deleteMany({});
  await prisma.systemConfig.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.company.deleteMany({});

  console.log('🧹 Cleaned existing data');

  // Create super admin user
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@smscloudmx.com',
      password: await bcrypt.hash('superadmin123', 12),
      firstName: 'Super',
      lastName: 'Admin',
      jobTitle: 'Super Administrator',
      role: 'SUPER_ADMIN',
      // No company association for super admin
    },
  });

  console.log('👑 Created super admin user');

  // Create default system configurations
  const systemConfigs = [
    { key: 'sms_price', value: '0.50', description: 'Precio por SMS en MXN' },
    { key: 'whatsapp_price', value: '0.30', description: 'Precio por mensaje de WhatsApp en MXN' },
    { key: 'default_credits', value: '100', description: 'Créditos asignados por defecto a nuevas empresas' },
    { key: 'max_daily_messages', value: '1000', description: 'Máximo de mensajes por día por empresa' },
    { key: 'system_email', value: 'admin@smscloudmx.com', description: 'Email del sistema para notificaciones' },
  ];

  await prisma.systemConfig.createMany({
    data: systemConfigs,
    skipDuplicates: true,
  });

  console.log('⚙️ Created system configurations');

  // Create demo companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'CloudMX Demo Company',
        email: 'admin@cloudmx.com',
        phone: '+52-55-1234-5678',
        website: 'https://cloudmx.com',
        address: '123 Demo Street',
        city: 'Mexico City',
        state: 'CDMX',
        country: 'Mexico',
        zipCode: '01000',
        credits: 1000, // Start with 1000 credits
      },
    }),
    prisma.company.create({
      data: {
        name: 'SMS Marketing Pro',
        email: 'contact@smsmarketing.com',
        phone: '+52-55-9876-5432',
        website: 'https://smsmarketing.com',
        address: '456 Marketing Ave',
        city: 'Guadalajara',
        state: 'Jalisco',
        country: 'Mexico',
        zipCode: '44100',
        credits: 500,
      },
    }),
  ]);

  console.log('🏢 Created demo companies');

  // Create users for each company
  const hashedPassword = await bcrypt.hash('demo123', 12);
  
  // Company 1 users
  const company1Admin = await prisma.user.create({
    data: {
      email: 'admin@cloudmx.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      jobTitle: 'Administrator',
      role: 'COMPANY_ADMIN',
      companyId: companies[0].id,
    },
  });

  const company1User = await prisma.user.create({
    data: {
      email: 'user@cloudmx.com',
      password: hashedPassword,
      firstName: 'Regular',
      lastName: 'User',
      jobTitle: 'Marketing Specialist',
      role: 'USER',
      companyId: companies[0].id,
    },
  });

  // Company 2 users
  const company2Admin = await prisma.user.create({
    data: {
      email: 'admin@smsmarketing.com',
      password: hashedPassword,
      firstName: 'Marketing',
      lastName: 'Admin',
      jobTitle: 'CEO',
      role: 'COMPANY_ADMIN',
      companyId: companies[1].id,
    },
  });

  // Test account as specified (hidden credentials)
  await prisma.user.create({
    data: {
      email: 'john@doe.com',
      password: await bcrypt.hash('johndoe123', 12),
      firstName: 'John',
      lastName: 'Doe',
      jobTitle: 'System Administrator',
      role: 'COMPANY_ADMIN',
      companyId: companies[0].id,
    },
  });

  console.log('👥 Created demo users');

  // Create sample contact lists for Company 1
  const contactList1 = await prisma.contactList.create({
    data: {
      name: 'VIP Customers',
      description: 'Our most valued customers',
      totalContacts: 3,
      validContacts: 3,
      companyId: companies[0].id,
      createdById: company1Admin.id,
    },
  });

  const contactList2 = await prisma.contactList.create({
    data: {
      name: 'Prospects',
      description: 'Potential customers',
      totalContacts: 2,
      validContacts: 2,
      companyId: companies[0].id,
      createdById: company1User.id,
    },
  });

  console.log('📋 Created demo contact lists');

  // Create sample contacts
  await prisma.contact.createMany({
    data: [
      // VIP Customers
      {
        phone: '+52-55-1111-1111',
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        email: 'carlos@email.com',
        company: 'Tech Solutions',
        contactListId: contactList1.id,
        customFields: { segment: 'premium', lastPurchase: '2024-01-15' },
      },
      {
        phone: '+52-55-2222-2222',
        firstName: 'Ana',
        lastName: 'Martinez',
        email: 'ana@email.com',
        company: 'Design Studio',
        contactListId: contactList1.id,
        customFields: { segment: 'premium', lastPurchase: '2024-01-20' },
      },
      {
        phone: '+52-55-3333-3333',
        firstName: 'Luis',
        lastName: 'Garcia',
        email: 'luis@email.com',
        company: 'Consulting Group',
        contactListId: contactList1.id,
        customFields: { segment: 'premium', lastPurchase: '2024-01-25' },
      },
      // Prospects
      {
        phone: '+52-55-4444-4444',
        firstName: 'Maria',
        lastName: 'Lopez',
        email: 'maria@email.com',
        company: 'Startup Inc',
        contactListId: contactList2.id,
        customFields: { segment: 'prospect', source: 'website' },
      },
      {
        phone: '+52-55-5555-5555',
        firstName: 'Pedro',
        lastName: 'Sanchez',
        email: 'pedro@email.com',
        company: 'Growth Co',
        contactListId: contactList2.id,
        customFields: { segment: 'prospect', source: 'referral' },
      },
    ],
  });

  console.log('📞 Created demo contacts');

  // Create sample campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      name: 'Holiday Promotion',
      message: 'Hola {{firstName}}, tenemos una oferta especial solo para ti. Visita nuestro sitio web y usa el código HOLIDAY2024 para obtener 20% de descuento. ¡No te lo pierdas!',
      status: 'SENT',
      totalRecipients: 3,
      sentCount: 3,
      deliveredCount: 2,
      failedCount: 1,
      creditsUsed: 3,
      completedAt: new Date('2024-01-10'),
      companyId: companies[0].id,
      contactListId: contactList1.id,
      createdById: company1Admin.id,
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      name: 'Product Launch',
      message: 'Hola {{firstName}}, estamos emocionados de presentar nuestro nuevo producto. Como cliente {{segment}}, tienes acceso prioritario. ¡Échale un vistazo!',
      status: 'DRAFT',
      totalRecipients: 2,
      companyId: companies[0].id,
      contactListId: contactList2.id,
      createdById: company1User.id,
    },
  });

  console.log('📱 Created demo campaigns');

  // Create sample messages for the sent campaign
  await prisma.message.createMany({
    data: [
      {
        phone: '+52-55-1111-1111',
        message: 'Hola Carlos, tenemos una oferta especial solo para ti. Visita nuestro sitio web y usa el código HOLIDAY2024 para obtener 20% de descuento. ¡No te lo pierdas!',
        status: 'DELIVERED',
        sentAt: new Date('2024-01-10T10:00:00Z'),
        deliveredAt: new Date('2024-01-10T10:01:00Z'),
        creditsUsed: 1,
        campaignId: campaign1.id,
      },
      {
        phone: '+52-55-2222-2222',
        message: 'Hola Ana, tenemos una oferta especial solo para ti. Visita nuestro sitio web y usa el código HOLIDAY2024 para obtener 20% de descuento. ¡No te lo pierdas!',
        status: 'DELIVERED',
        sentAt: new Date('2024-01-10T10:00:00Z'),
        deliveredAt: new Date('2024-01-10T10:02:00Z'),
        creditsUsed: 1,
        campaignId: campaign1.id,
      },
      {
        phone: '+52-55-3333-3333',
        message: 'Hola Luis, tenemos una oferta especial solo para ti. Visita nuestro sitio web y usa el código HOLIDAY2024 para obtener 20% de descuento. ¡No te lo pierdas!',
        status: 'FAILED',
        sentAt: new Date('2024-01-10T10:00:00Z'),
        failReason: 'Invalid phone number',
        creditsUsed: 1,
        campaignId: campaign1.id,
      },
    ],
  });

  console.log('📨 Created demo messages');

  // Create sample credit transactions
  await prisma.creditTransaction.createMany({
    data: [
      {
        type: 'PURCHASE',
        amount: 1000,
        balance: 1000,
        description: 'Initial credit purchase',
        companyId: companies[0].id,
      },
      {
        type: 'USAGE',
        amount: -3,
        balance: 997,
        description: 'Holiday Promotion campaign',
        reference: campaign1.id,
        companyId: companies[0].id,
      },
      {
        type: 'PURCHASE',
        amount: 500,
        balance: 500,
        description: 'Initial credit purchase',
        companyId: companies[1].id,
      },
    ],
  });

  console.log('💳 Created demo credit transactions');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('\n👑 SUPER ADMIN:');
  console.log('  - superadmin@smscloudmx.com / superadmin123');
  console.log('\nCompany 1 (CloudMX Demo):');
  console.log('  - admin@cloudmx.com / demo123 (Admin)');
  console.log('  - user@cloudmx.com / demo123 (User)');
  console.log('\nCompany 2 (SMS Marketing Pro):');
  console.log('  - admin@smsmarketing.com / demo123 (Admin)');
  console.log('\nTest Account (hidden):');
  console.log('  - john@doe.com / johndoe123 (Admin)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
