import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Moneto Idempotent Database Seeding...');

  // System Default Transaction Categories
  const systemCategories = [
    { name: 'Salary & Income', type: 'income', icon: 'briefcase', color: '#10B981', isSystem: true },
    { name: 'Investment Returns', type: 'income', icon: 'trending-up', color: '#059669', isSystem: true },
    { name: 'Freelance & Side Business', type: 'income', icon: 'code', color: '#3B82F6', isSystem: true },
    { name: 'Housing & Rent', type: 'expense', icon: 'home', color: '#EF4444', isSystem: true },
    { name: 'Utilities & Bills', type: 'expense', icon: 'zap', color: '#F59E0B', isSystem: true },
    { name: 'Groceries & Dining', type: 'expense', icon: 'shopping-cart', color: '#8B5CF6', isSystem: true },
    { name: 'Transportation & Fuel', type: 'expense', icon: 'car', color: '#6366F1', isSystem: true },
    { name: 'Healthcare & Medical', type: 'expense', icon: 'activity', color: '#EC4899', isSystem: true },
    { name: 'Entertainment & Leisure', type: 'expense', icon: 'film', color: '#14B8A6', isSystem: true },
    { name: 'Account Transfer', type: 'transfer', icon: 'repeat', color: '#64748B', isSystem: true },
  ];

  for (const cat of systemCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        name: cat.name,
        isSystem: true,
        userId: null,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: cat,
      });
      console.log(`  + Created System Category: ${cat.name}`);
    } else {
      console.log(`  = System Category already exists: ${cat.name}`);
    }
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during Prisma seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
