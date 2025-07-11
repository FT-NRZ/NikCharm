// app/api/auth/verify/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'nikcharm-secret-key-2024'

export async function POST(request) {
  console.log('=== Auth Verify API Called ===')
  
  try {
    // دریافت تمام headers برای debug
    const headers = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })
    console.log('All Headers:', headers)

    // بررسی Authorization header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    console.log('Authorization Header:', authHeader)
    
    if (!authHeader) {
      console.log('❌ No Authorization header found')
      return NextResponse.json({
        success: false,
        message: 'Authorization header مطلوب است',
        debug: 'No auth header'
      }, { status: 401 })
    }

    // استخراج token
    let token
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else if (authHeader.startsWith('bearer ')) {
      token = authHeader.substring(7)
    } else {
      token = authHeader
    }

    console.log('Token extracted:', token ? `${token.substring(0, 20)}... (${token.length} chars)` : 'No token')

    if (!token || token.trim() === '') {
      console.log('❌ Empty or invalid token')
      return NextResponse.json({
        success: false,
        message: 'Token مطلوب است',
        debug: 'Empty token'
      }, { status: 401 })
    }

    // تأیید token
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
      console.log('✅ Token verified successfully')
      console.log('Decoded payload:', JSON.stringify(decoded, null, 2))
    } catch (jwtError) {
      console.error('❌ JWT Error:', jwtError.message)
      console.error('JWT Error Type:', jwtError.name)
      return NextResponse.json({
        success: false,
        message: 'Token نامعتبر یا منقضی شده',
        debug: `JWT Error: ${jwtError.message}`
      }, { status: 401 })
    }

    // بررسی وجود userId در decoded token
    if (!decoded.userId) {
      console.log('❌ No userId in token')
      return NextResponse.json({
        success: false,
        message: 'Token نامعتبر - userId یافت نشد',
        debug: 'No userId in token payload'
      }, { status: 401 })
    }

    console.log('Looking for user with ID:', decoded.userId)
    
    // دریافت اطلاعات کاربر از دیتابیس
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    })

    console.log('User found:', user ? `${user.username} (ID: ${user.id})` : 'No user found')

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({
        success: false,
        message: 'کاربر یافت نشد',
        debug: 'User not found in database'
      }, { status: 401 })
    }

    if (!user.isactive) {
      console.log('❌ User is inactive')
      return NextResponse.json({
        success: false,
        message: 'حساب کاربری غیرفعال است',
        debug: 'User account is inactive'
      }, { status: 401 })
    }

    // بررسی اعتبار token در جدول login_records
    console.log('Checking login_records for token...')
    const loginRecord = await prisma.login_records.findFirst({
      where: {
        user_id: user.id,
        token: token,
        expirationdate: {
          gt: new Date()
        }
      }
    })

    console.log('Login record found:', loginRecord ? 'Yes' : 'No')
    if (loginRecord) {
      console.log('Login record expiration:', loginRecord.expirationdate)
      console.log('Current time:', new Date())
    }

    if (!loginRecord) {
      console.log('❌ Token not found in login_records or expired')
      
      // بررسی آیا token اصلاً در جدول وجود دارد
      const anyTokenRecord = await prisma.login_records.findFirst({
        where: {
          user_id: user.id,
          token: token
        }
      })
      
      if (anyTokenRecord) {
        console.log('Token exists but expired. Expiration was:', anyTokenRecord.expirationdate)
      } else {
        console.log('Token not found in login_records at all')
      }
      
      return NextResponse.json({
        success: false,
        message: 'Token منقضی شده یا نامعتبر',
        debug: 'Token not found in login_records or expired'
      }, { status: 401 })
    }

    const userRoles = user.user_roles?.map(ur => ur.roles.name) || []
    console.log('✅ Auth verification successful for user:', user.username)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        phoneNumber: user.phone_number,
        role: decoded.role,
        roles: userRoles
      }
    })

  } catch (error) {
    console.error('❌ Unexpected error in auth verify:', error)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json({
      success: false,
      message: 'خطا در سرور - لطفا دوباره تلاش کنید',
      debug: `Server error: ${error.message}`
    }, { status: 500 })
  }
}