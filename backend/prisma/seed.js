import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mecheasy.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@mecheasy.com',
      phone: '9999999999',
      password: adminPassword,
      role: 'admin'
    }
  });
  console.log('✅ Created admin user:', admin.email);

  // Create sample mechanic user
  const mechanicPassword = await bcrypt.hash('mechanic123', 10);
  const mechanic = await prisma.user.upsert({
    where: { email: 'mechanic@mecheasy.com' },
    update: {},
    create: {
      name: 'John Mechanic',
      email: 'mechanic@mecheasy.com',
      phone: '8888888888',
      password: mechanicPassword,
      role: 'mechanic'
    }
  });
  console.log('✅ Created mechanic user:', mechanic.email);

  // Create sample regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@mecheasy.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@mecheasy.com',
      phone: '7777777777',
      password: userPassword,
      role: 'user'
    }
  });
  console.log('✅ Created test user:', user.email);

  // Create services
  const services = [
    {
      name: 'General Service',
      description: 'Complete bike check-up including engine oil change, air filter cleaning, chain lubrication, and brake adjustment',
      price: 50000, // ₹500.00 in paise
      duration: 120, // 2 hours
      category: 'maintenance'
    },
    {
      name: 'Oil Change',
      description: 'Engine oil and oil filter replacement with premium quality oil',
      price: 30000, // ₹300.00
      duration: 30,
      category: 'maintenance'
    },
    {
      name: 'Brake Service',
      description: 'Brake pad replacement, brake fluid check, and brake adjustment for optimal braking performance',
      price: 40000, // ₹400.00
      duration: 60,
      category: 'repair'
    },
    {
      name: 'Chain Lubrication',
      description: 'Chain cleaning and lubrication with high-quality chain lubricant',
      price: 10000, // ₹100.00
      duration: 15,
      category: 'maintenance'
    },
    {
      name: 'Basic Bike Wash',
      description: 'Exterior washing and cleaning with water and shampoo',
      price: 15000, // ₹150.00
      duration: 30,
      category: 'wash'
    },
    {
      name: 'Premium Bike Wash',
      description: 'Deep cleaning with foam wash, tire polishing, and interior detailing',
      price: 35000, // ₹350.00
      duration: 45,
      category: 'wash'
    },
    {
      name: 'Full Detail Wash',
      description: 'Complete detailing with foam wash, waxing, polishing, chain cleaning, and interior deep clean',
      price: 60000, // ₹600.00
      duration: 90,
      category: 'wash'
    },
    {
      name: 'Full Service Package',
      description: 'Comprehensive package including general service, oil change, chain lubrication, and premium wash',
      price: 120000, // ₹1200.00
      duration: 180,
      category: 'package'
    },
    {
      name: 'Tire Replacement',
      description: 'Front or rear tire replacement with new tire (tire cost additional)',
      price: 25000, // ₹250.00 (labor only)
      duration: 45,
      category: 'repair'
    },
    {
      name: 'Battery Replacement',
      description: 'Old battery removal and new battery installation (battery cost additional)',
      price: 20000, // ₹200.00 (labor only)
      duration: 20,
      category: 'repair'
    }
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: services.indexOf(service) + 1 },
      update: {},
      create: service
    });
  }
  console.log(`✅ Created ${services.length} services`);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@mecheasy.com / admin123');
  console.log('Mechanic: mechanic@mecheasy.com / mechanic123');
  console.log('User: user@mecheasy.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
