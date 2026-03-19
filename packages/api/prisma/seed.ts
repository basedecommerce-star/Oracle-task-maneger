import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // --- Country ---
  console.log('Creating country: Moldova');
  const moldova = await prisma.country.upsert({
    where: { code: 'MD' },
    update: {},
    create: {
      code: 'MD',
      nameRu: 'Молдова',
      nameRo: 'Moldova',
    },
  });
  console.log(`  ✔ Country: ${moldova.nameRo} (${moldova.id})`);

  // --- Categories ---
  console.log('Creating categories...');
  const categoryDefs = [
    { code: 'A', nameRu: 'Категория A', nameRo: 'Categoria A', sortOrder: 1 },
    { code: 'B', nameRu: 'Категория B', nameRo: 'Categoria B', sortOrder: 2 },
    { code: 'AM', nameRu: 'Категория AM', nameRo: 'Categoria AM', sortOrder: 3 },
    { code: 'A1', nameRu: 'Категория A1', nameRo: 'Categoria A1', sortOrder: 4 },
    { code: 'A2', nameRu: 'Категория A2', nameRo: 'Categoria A2', sortOrder: 5 },
    { code: 'B1', nameRu: 'Категория B1', nameRo: 'Categoria B1', sortOrder: 6 },
    { code: 'BE', nameRu: 'Категория BE', nameRo: 'Categoria BE', sortOrder: 7 },
    { code: 'C', nameRu: 'Категория C', nameRo: 'Categoria C', sortOrder: 8 },
    { code: 'CE', nameRu: 'Категория CE', nameRo: 'Categoria CE', sortOrder: 9 },
    { code: 'D', nameRu: 'Категория D', nameRo: 'Categoria D', sortOrder: 10 },
    { code: 'DE', nameRu: 'Категория DE', nameRo: 'Categoria DE', sortOrder: 11 },
    { code: 'F', nameRu: 'Категория F', nameRo: 'Categoria F', sortOrder: 12 },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoryDefs) {
    const category = await prisma.category.upsert({
      where: {
        code_countryId: { code: cat.code, countryId: moldova.id },
      },
      update: {},
      create: {
        code: cat.code,
        nameRu: cat.nameRu,
        nameRo: cat.nameRo,
        sortOrder: cat.sortOrder,
        countryId: moldova.id,
      },
    });
    categories[cat.code] = category;
    console.log(`  ✔ Category: ${cat.code}`);
  }

  // --- Exam Configs ---
  console.log('Creating exam configs...');

  interface ExamConfigParams {
    totalQuestions: number;
    durationSeconds: number;
    passThresholdCorrect: number;
    maxErrors: number;
  }

  const tier1: ExamConfigParams = {
    totalQuestions: 24,
    durationSeconds: 1800,
    passThresholdCorrect: 22,
    maxErrors: 2,
  };
  const tier2: ExamConfigParams = {
    totalQuestions: 30,
    durationSeconds: 2280,
    passThresholdCorrect: 27,
    maxErrors: 3,
  };
  const tier3: ExamConfigParams = {
    totalQuestions: 36,
    durationSeconds: 2700,
    passThresholdCorrect: 32,
    maxErrors: 4,
  };

  const examConfigMap: Record<string, ExamConfigParams> = {
    A: tier1,
    B: tier1,
    AM: tier1,
    A1: tier1,
    A2: tier1,
    B1: tier1,
    BE: tier2,
    C: tier2,
    D: tier2,
    F: tier2,
    CE: tier3,
    DE: tier3,
  };

  for (const [code, params] of Object.entries(examConfigMap)) {
    await prisma.examConfig.upsert({
      where: {
        countryId_categoryId: {
          countryId: moldova.id,
          categoryId: categories[code].id,
        },
      },
      update: {},
      create: {
        countryId: moldova.id,
        categoryId: categories[code].id,
        totalQuestions: params.totalQuestions,
        durationSeconds: params.durationSeconds,
        passThresholdCorrect: params.passThresholdCorrect,
        maxErrors: params.maxErrors,
        activeFrom: new Date('2024-01-01'),
        sourcePriority: 'A',
        verified: true,
        sourceReference: 'ASP Moldova official parameters',
      },
    });
    console.log(`  ✔ ExamConfig: ${code}`);
  }

  // --- Topics ---
  console.log('Creating topics...');
  const topicDefs = [
    { code: 'general', nameRu: 'Общие положения', nameRo: 'Dispoziții generale', sortOrder: 1 },
    { code: 'signs', nameRu: 'Дорожные знаки', nameRo: 'Indicatoare rutiere', sortOrder: 2 },
    { code: 'markings', nameRu: 'Дорожная разметка', nameRo: 'Marcajul rutier', sortOrder: 3 },
    { code: 'maneuvering', nameRu: 'Маневрирование', nameRo: 'Manevrarea', sortOrder: 4 },
    { code: 'intersections', nameRu: 'Перекрёстки', nameRo: 'Intersecții', sortOrder: 5 },
    { code: 'parking', nameRu: 'Остановка и стоянка', nameRo: 'Oprirea și staționarea', sortOrder: 6 },
    { code: 'priority', nameRu: 'Приоритет движения', nameRo: 'Prioritatea de trecere', sortOrder: 7 },
    { code: 'first_aid', nameRu: 'Первая помощь', nameRo: 'Primul ajutor', sortOrder: 8 },
    { code: 'safety', nameRu: 'Превентивная безопасность', nameRo: 'Siguranța preventivă', sortOrder: 9 },
    { code: 'special_cdf', nameRu: 'Спецвопросы C/D/E/F', nameRo: 'Întrebări speciale C/D/E/F', sortOrder: 10 },
  ];

  for (const topic of topicDefs) {
    await prisma.topic.upsert({
      where: { code: topic.code },
      update: {},
      create: {
        code: topic.code,
        nameRu: topic.nameRu,
        nameRo: topic.nameRo,
        sortOrder: topic.sortOrder,
      },
    });
    console.log(`  ✔ Topic: ${topic.code}`);
  }

  // --- Source Providers ---
  console.log('Creating source providers...');
  const providerDefs = [
    { name: 'ASP Moldova', url: 'https://asp.gov.md', sourcePriority: 'A', isActive: true },
    { name: 'auto-test.online', url: 'https://auto-test.online', sourcePriority: 'B', isActive: true },
    { name: 'pdd-md.online', url: 'https://pdd-md.online', sourcePriority: 'B', isActive: true },
  ];

  for (const provider of providerDefs) {
    await prisma.sourceProvider.upsert({
      where: { name: provider.name },
      update: {},
      create: {
        name: provider.name,
        url: provider.url,
        sourcePriority: provider.sourcePriority,
        isActive: provider.isActive,
      },
    });
    console.log(`  ✔ SourceProvider: ${provider.name}`);
  }

  // --- Admin User ---
  // NOTE: Change this password hash in production! This is a placeholder.
  console.log('Creating default admin user...');
  await prisma.adminUser.upsert({
    where: { email: 'admin@pdd-moldova.md' },
    update: {},
    create: {
      email: 'admin@pdd-moldova.md',
      // Placeholder bcrypt hash — CHANGE IN PRODUCTION
      passwordHash: '$2b$10$placeholder.hash.change.in.production.000000000000000000',
      displayName: 'System Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log('  ✔ AdminUser: admin@pdd-moldova.md');

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
