import { loadEnv } from './load-env.mjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

loadEnv();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // 使用 upsert 保证重复执行种子命令时不会插入重复数据。
  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {
      name: '演示用户',
    },
    create: {
      email: 'demo@example.com',
      name: '演示用户',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('种子数据写入失败：', error);
    await prisma.$disconnect();
    process.exit(1);
  });
