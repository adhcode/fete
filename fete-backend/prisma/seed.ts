import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample templates
  const template1 = await prisma.template.upsert({
    where: { id: 'template-classic' },
    update: {},
    create: {
      id: 'template-classic',
      name: 'Classic',
      overlayKey: 'templates/classic/overlay.png',
      previewUrl: 'https://pub-xxx.r2.dev/templates/classic/preview.jpg',
      config: {
        version: '1.0',
        overlay: {
          opacity: 1,
          blendMode: 'normal',
        },
        textFields: [
          {
            id: 'eventName',
            defaultValue: '{{event.name}}',
            x: 50,
            y: 88, // Bottom of image (Snapchat style)
            fontSize: 42,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            color: '#FFFFFF',
            align: 'center',
            shadow: {
              offsetX: 2,
              offsetY: 2,
              blur: 6,
              color: 'rgba(0,0,0,0.9)',
            },
          },
        ],
        safeArea: {
          top: 15,
          bottom: 15,
          left: 5,
          right: 5,
        },
      },
    },
  });

  const template2 = await prisma.template.upsert({
    where: { id: 'template-minimal' },
    update: {},
    create: {
      id: 'template-minimal',
      name: 'Minimal',
      overlayKey: 'templates/minimal/overlay.png',
      previewUrl: 'https://pub-xxx.r2.dev/templates/minimal/preview.jpg',
      config: {
        version: '1.0',
        overlay: {
          opacity: 0.9,
          blendMode: 'normal',
        },
        textFields: [
          {
            id: 'eventName',
            defaultValue: '{{event.name}}',
            x: 50,
            y: 90,
            fontSize: 36,
            fontFamily: 'Arial',
            fontWeight: '600',
            color: '#FFFFFF',
            align: 'center',
            shadow: {
              offsetX: 1,
              offsetY: 1,
              blur: 4,
              color: 'rgba(0,0,0,0.7)',
            },
          },
        ],
        safeArea: {
          top: 10,
          bottom: 10,
          left: 5,
          right: 5,
        },
      },
    },
  });

  const template3 = await prisma.template.upsert({
    where: { id: 'template-party' },
    update: {},
    create: {
      id: 'template-party',
      name: 'Party',
      overlayKey: 'templates/party/overlay.png',
      previewUrl: 'https://pub-xxx.r2.dev/templates/party/preview.jpg',
      config: {
        version: '1.0',
        overlay: {
          opacity: 1,
          blendMode: 'normal',
        },
        textFields: [
          {
            id: 'eventName',
            defaultValue: '{{event.name}}',
            x: 50,
            y: 85,
            fontSize: 48,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            color: '#FF00FF',
            align: 'center',
            shadow: {
              offsetX: 3,
              offsetY: 3,
              blur: 8,
              color: 'rgba(0,0,0,0.9)',
            },
          },
          {
            id: 'hashtag',
            defaultValue: '#{{event.hashtag}}',
            x: 50,
            y: 93,
            fontSize: 32,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            color: '#FFFF00',
            align: 'center',
            shadow: {
              offsetX: 2,
              offsetY: 2,
              blur: 6,
              color: 'rgba(0,0,0,0.8)',
            },
          },
        ],
        safeArea: {
          top: 12,
          bottom: 12,
          left: 5,
          right: 5,
        },
      },
    },
  });

  console.log('Created templates:', [template1.id, template2.id, template3.id]);

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

  // Create event with specific code and template
  const event = await prisma.event.upsert({
    where: { code: 'AB3X9K' },
    update: {
      name: 'Summer Beach Party 2026 🌊',
      templateId: template1.id,
      hashtag: 'BeachParty2026',
      date: new Date('2026-07-15'),
      venue: 'Santa Monica Beach',
    },
    create: {
      code: 'AB3X9K',
      name: 'Summer Beach Party 2026 🌊',
      organizerId: organizer.id,
      approvalRequired: false,
      publicGallery: true,
      allowShareLinks: true,
      templateId: template1.id,
      hashtag: 'BeachParty2026',
      date: new Date('2026-07-15'),
      venue: 'Santa Monica Beach',
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
