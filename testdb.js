import { prisma } from './lib/prisma.js'

async function testConnection() {
  try {
    console.log('در حال تست اتصال به پایگاه داده...')
    
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ اتصال موفق:', result)
    
    const userCount = await prisma.users.count()
    console.log(`✅ تعداد کاربران: ${userCount}`)
    
  } catch (error) {
    console.error('❌ خطا در اتصال:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()