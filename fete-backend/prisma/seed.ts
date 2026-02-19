import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create organizer
  const organizer = await prisma.organizer.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: 'hashed_password_here', // In real app, use bcrypt
      name: 'Test Organizer',
    },
  });

  console.log('Created organizer:', organizer.id);

  // Create event with specific code
  const event = await prisma.event.upsert({
    where: { code: 'AB3X9K' },
    update: {},
    create: {
      code: 'AB3X9K',
      name: 'Test Event',
      organizerId: organizer.id,
      approvalRequired: false,
      publicGallery: true,
      allowShareLinks: true,
    },
  });

  console.log('Created event:', event.code);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
