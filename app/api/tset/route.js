import pool from '../../../lib/db'

export async function GET() {
  try {
    const result = await pool.query('SELECT NOW() as current_time')
    
    return Response.json({ 
      success: true,
      message: '🎉 اتصال به دیتابیس موفق!', 
      time: result.rows[0].current_time,
      database: 'leather_shop'
    })
    
  } catch (error) {
    console.error('❌ خطا در اتصال:', error)
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
  }
}