// lib/prisma.js
import { PrismaClient } from '@prisma/client';

// جلوگیری از ایجاد نمونه‌های تکراری PrismaClient در حالت توسعه
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma;
}

export default prisma;