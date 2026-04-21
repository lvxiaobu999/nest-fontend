import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { loadEnv } from './load-env.mjs';

loadEnv();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

function toDateOnly(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function main() {
  await prisma.user.upsert({
    where: { username: 'demo-admin' },
    update: {
      nickname: '演示管理员',
      password: '123456',
      isSuperAdmin: 1,
      enabled: 1,
      remark: '用于本地联调的初始化账号',
    },
    create: {
      username: 'demo-admin',
      password: '123456',
      nickname: '演示管理员',
      isSuperAdmin: 1,
      enabled: 1,
      remark: '用于本地联调的初始化账号',
    },
  });

  const metricDate = toDateOnly(new Date());

  await prisma.dashboardCoreMetric.upsert({
    where: { metricDate },
    update: {
      todayVisits: 68,
      blockedCount: 51,
      payUsers: 31,
      payOrders: 119,
      totalVisits: 6539,
      payConversionRate: '71.6',
    },
    create: {
      metricDate,
      todayVisits: 68,
      blockedCount: 51,
      payUsers: 31,
      payOrders: 119,
      totalVisits: 6539,
      payConversionRate: '71.6',
    },
  });

  const domainRecords = [];

  for (const name of ['domain1.com', 'domain2.com', 'domain3.com']) {
    const domain = await prisma.dashboardDomain.upsert({
      where: { name },
      update: { enabled: 1 },
      create: { name, enabled: 1 },
    });

    domainRecords.push(domain);
  }

  const primaryDomain = domainRecords.find((item) => item.name === 'domain1.com');

  if (!primaryDomain) {
    throw new Error('dashboard seed failed: primary domain was not created');
  }

  const chartSeed = [
    { offset: 6, visits: 4, payments: 26 },
    { offset: 5, visits: 274, payments: 140 },
    { offset: 4, visits: 398, payments: 39 },
    { offset: 3, visits: 341, payments: 26 },
    { offset: 2, visits: 513, payments: 5 },
    { offset: 1, visits: 392, payments: 20 },
    { offset: 0, visits: 95, payments: 20 },
  ];

  for (const item of chartSeed) {
    const statDate = toDateOnly(new Date());
    statDate.setUTCDate(statDate.getUTCDate() - item.offset);

    await prisma.dashboardDomainStat.upsert({
      where: {
        domainId_statDate: {
          domainId: primaryDomain.id,
          statDate,
        },
      },
      update: {
        visits: item.visits,
        payments: item.payments,
      },
      create: {
        domainId: primaryDomain.id,
        statDate,
        visits: item.visits,
        payments: item.payments,
      },
    });
  }

  await prisma.dashboardSystemSnapshot.create({
    data: {
      reportTime: new Date(),
      serverStatus: '正常',
      alertCount: 5,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('种子数据写入失败:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
