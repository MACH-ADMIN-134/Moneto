import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Moneto Idempotent Database Seeding...');

  // 1. System Default Transaction Categories
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

  // 2. Demo User Seed
  const demoEmail = 'demo@moneto.io';
  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!demoUser) {
    const hashedPassword = await argon2.hash('Password123!');
    demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        passwordHash: hashedPassword,
        fullName: 'Alex Vance',
        role: 'user',
        status: 'active',
        settings: {
          create: {
            theme: 'system',
            defaultCurrency: 'USD',
            emailNotifications: true,
            pushNotifications: true,
            twoFactorEnabled: false,
          },
        },
      },
    });
    console.log(`  + Created Demo User: ${demoUser.email}`);
  } else {
    console.log(`  = Demo User already exists: ${demoUser.email}`);
  }

  // 3. Accounts Seed
  const existingAccounts = await prisma.account.count({ where: { userId: demoUser.id } });
  if (existingAccounts === 0) {
    const checkingAcc = await prisma.account.create({
      data: {
        userId: demoUser.id,
        name: 'Primary Checking',
        type: 'checking',
        balance: 8450.00,
        currency: 'USD',
        institution: 'Chase Bank',
        accountNumber: '****4821',
      },
    });

    const savingsAcc = await prisma.account.create({
      data: {
        userId: demoUser.id,
        name: 'High Yield Savings',
        type: 'savings',
        balance: 14200.50,
        currency: 'USD',
        institution: 'Marcus by Goldman',
        accountNumber: '****9104',
      },
    });

    await prisma.account.create({
      data: {
        userId: demoUser.id,
        name: 'Sapphire Credit Card',
        type: 'credit_card',
        balance: -1250.00,
        currency: 'USD',
        institution: 'Chase Bank',
        accountNumber: '****3390',
      },
    });

    console.log('  + Created Default Accounts');

    // Seed Categories for Demo User
    const salaryCat = await prisma.category.findFirst({ where: { name: 'Salary & Income' } });
    const rentCat = await prisma.category.findFirst({ where: { name: 'Housing & Rent' } });
    const groceriesCat = await prisma.category.findFirst({ where: { name: 'Groceries & Dining' } });
    const utilitiesCat = await prisma.category.findFirst({ where: { name: 'Utilities & Bills' } });

    // Seed Transactions
    if (salaryCat && rentCat && groceriesCat && utilitiesCat) {
      await prisma.transaction.createMany({
        data: [
          {
            userId: demoUser.id,
            accountId: checkingAcc.id,
            categoryId: salaryCat.id,
            amount: 5200.00,
            currency: 'USD',
            type: 'income',
            description: 'Bi-weekly Tech Salary Deposit',
            transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            userId: demoUser.id,
            accountId: checkingAcc.id,
            categoryId: rentCat.id,
            amount: 1850.00,
            currency: 'USD',
            type: 'expense',
            description: 'Luxury Apartment Monthly Rent',
            transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            userId: demoUser.id,
            accountId: checkingAcc.id,
            categoryId: groceriesCat.id,
            amount: 142.80,
            currency: 'USD',
            type: 'expense',
            description: 'Whole Foods Market',
            transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            userId: demoUser.id,
            accountId: checkingAcc.id,
            categoryId: utilitiesCat.id,
            amount: 85.50,
            currency: 'USD',
            type: 'expense',
            description: 'High Speed Fiber Internet',
            transactionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
        ],
      });
      console.log('  + Created Initial Sample Transactions');

      // Seed Budgets
      await prisma.budget.createMany({
        data: [
          {
            userId: demoUser.id,
            categoryId: rentCat.id,
            amount: 2000.00,
            currency: 'USD',
            period: 'monthly',
            startDate: new Date(),
          },
          {
            userId: demoUser.id,
            categoryId: groceriesCat.id,
            amount: 600.00,
            currency: 'USD',
            period: 'monthly',
            startDate: new Date(),
          },
          {
            userId: demoUser.id,
            categoryId: utilitiesCat.id,
            amount: 200.00,
            currency: 'USD',
            period: 'monthly',
            startDate: new Date(),
          },
        ],
      });
      console.log('  + Created Category Budgets');
    }
  }

  // 4. Peer Loans Seed
  const existingLoans = await prisma.lendRequest.count({ where: { userId: demoUser.id } });
  if (existingLoans === 0) {
    await prisma.lendRequest.create({
      data: {
        userId: demoUser.id,
        counterpartyName: 'Marcus Wright',
        counterpartyContact: 'marcus@example.com',
        type: 'lent',
        principalAmount: 750.00,
        interestRate: 0.00,
        currency: 'USD',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        notes: 'Loan for laptop repair',
      },
    });
    console.log('  + Created Peer Loan Seed');
  }

  // 5. Investments Seed
  const existingInvestments = await prisma.investment.count({ where: { userId: demoUser.id } });
  if (existingInvestments === 0) {
    await prisma.investment.createMany({
      data: [
        {
          userId: demoUser.id,
          name: 'Apple Inc.',
          symbol: 'AAPL',
          type: 'stock',
          quantity: 15,
          buyPrice: 175.50,
          currentPrice: 224.30,
          currency: 'USD',
        },
        {
          userId: demoUser.id,
          name: 'Vanguard S&P 500 ETF',
          symbol: 'VOO',
          type: 'etf',
          quantity: 25,
          buyPrice: 410.00,
          currentPrice: 485.60,
          currency: 'USD',
        },
        {
          userId: demoUser.id,
          name: 'Bitcoin',
          symbol: 'BTC',
          type: 'crypto',
          quantity: 0.45,
          buyPrice: 42000.00,
          currentPrice: 65400.00,
          currency: 'USD',
        },
      ],
    });
    console.log('  + Created Investment Portfolio Seed');
  }

  // 6. Savings Goals Seed
  const existingGoals = await prisma.goal.count({ where: { userId: demoUser.id } });
  if (existingGoals === 0) {
    await prisma.goal.createMany({
      data: [
        {
          userId: demoUser.id,
          title: 'Emergency Reserve Fund',
          targetAmount: 20000.00,
          currentAmount: 14200.50,
          currency: 'USD',
          category: 'Safety',
          status: 'in_progress',
          targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        },
        {
          userId: demoUser.id,
          title: 'European Summer Trip',
          targetAmount: 5000.00,
          currentAmount: 3200.00,
          currency: 'USD',
          category: 'Travel',
          status: 'in_progress',
          targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        },
      ],
    });
    console.log('  + Created Savings Goals Seed');
  }

  // 7. Payables / Bills Seed
  const existingPayables = await prisma.payable.count({ where: { userId: demoUser.id } });
  if (existingPayables === 0) {
    await prisma.payable.createMany({
      data: [
        {
          userId: demoUser.id,
          title: 'Electric & Gas Utility',
          billerName: 'ConEdison',
          amount: 110.40,
          currency: 'USD',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          frequency: 'monthly',
          status: 'pending',
        },
        {
          userId: demoUser.id,
          title: 'Fiber Internet Subscription',
          billerName: 'Verizon Fios',
          amount: 79.99,
          currency: 'USD',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          frequency: 'monthly',
          status: 'pending',
        },
      ],
    });
    console.log('  + Created Payables Seed');
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
