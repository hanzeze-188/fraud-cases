import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: '电信诈骗', slug: 'telecom-fraud', description: '冒充运营商、银行客服等电话诈骗' },
  { name: '网络钓鱼', slug: 'phishing', description: '虚假网站、邮件、短信钓鱼骗局' },
  { name: '冒充身份', slug: 'identity-impersonation', description: '冒充公检法、领导、熟人等身份诈骗' },
  { name: '投资理财诈骗', slug: 'investment-fraud', description: '虚假投资平台、理财项目、杀猪盘' },
  { name: '交友诈骗', slug: 'romance-scam', description: '婚恋网站、社交软件上的感情诈骗' },
  { name: '兼职刷单诈骗', slug: 'part-time-job-scam', description: '刷单返利、兼职陷阱、垫付骗局' },
];

async function main() {
  console.log('开始填充分类数据...');

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log(`已创建 ${categories.length} 个分类`);
  console.log('种子数据填充完成！');
}

main()
  .catch((e) => {
    console.error('种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
