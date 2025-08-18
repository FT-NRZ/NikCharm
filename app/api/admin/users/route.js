import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'nikcharm-secret-key-2024';

export async function GET(request) {
  try {
    console.log('🔍 درخواست دریافت کاربران...');
    
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      console.log('❌ Authorization header نامعتبر');
      return NextResponse.json({
        success: false,
        message: 'لطفا وارد حساب کاربری خود شوید'
      }, { status: 401 });
    }

    const token = authorization.split(' ')[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token معتبر:', decoded);
    } catch (jwtError) {
      console.error('❌ JWT Error:', jwtError.message);
      return NextResponse.json({
        success: false,
        message: 'توکن نامعتبر است'
      }, { status: 401 });
    }
    
    const userId = decoded.userId || decoded.id;
    
    if (!userId) {
      console.log('❌ UserId یافت نشد');
      return NextResponse.json({
        success: false,
        message: 'اطلاعات کاربر نامعتبر'
      }, { status: 401 });
    }

    // بررسی مجوز ادمین
    try {
      const adminUser = await prisma.users.findUnique({
        where: { id: parseInt(userId) },
        include: {
          user_roles: {
            include: {
              roles: true
            }
          }
        }
      });

      if (!adminUser || !adminUser.user_roles.some(ur => ur.roles.name === 'admin')) {
        console.log('❌ کاربر مجوز ادمین ندارد');
        return NextResponse.json({
          success: false,
          message: 'شما مجوز دسترسی به این بخش را ندارید'
        }, { status: 403 });
      }

      console.log('✅ کاربر ادمین تایید شد');
    } catch (adminError) {
      console.error('❌ خطا در بررسی مجوز ادمین:', adminError);
      return NextResponse.json({
        success: false,
        message: 'خطا در بررسی مجوز دسترسی'
      }, { status: 500 });
    }

    // دریافت همه کاربران
    try {
      console.log('🔄 در حال دریافت کاربران...');
      
      const users = await prisma.users.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          full_name: true,
          phone_number: true,
          isactive: true,
          created_at: true,
          user_roles: {
            select: {
              roles: {
                select: {
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              orders: true,
              comments: true,
              login_records: true
            }
          }
        },
        orderBy: { id: 'desc' }
      });

      console.log(`✅ ${users.length} کاربر اصلی دریافت شد`);

      // ✅ برای هر کاربر، login_records و comments را جداگانه بگیریم
      const usersWithFullData = await Promise.all(users.map(async (user) => {
        try {
          // دریافت آخرین ورود
          const lastLogin = await prisma.login_records.findFirst({
            where: { user_id: user.id },
            orderBy: { login_time: 'desc' },
            select: {
              login_time: true
            }
          });

          console.log(`🔍 Login check for user ${user.id}:`, {
            found: !!lastLogin,
            login_time: lastLogin?.login_time
          });

          // ✅ دریافت نظرات کاربر با اطلاعات محصول
          const userComments = await prisma.comments.findMany({
            where: { user_id: user.id },
            orderBy: { date: 'desc' },
            take: 10,
            select: {
              comment_id: true, // استفاده از comment_id
              product_id: true,
              text: true,
              stars: true,
              date: true // استفاده از date
            }
          });

          console.log(`📋 User ${user.id} comments found:`, userComments.length);
        
          const commentsWithProduct = await Promise.all(userComments.map(async (comment) => {
            try {
              const product = await prisma.products.findUnique({
                where: { id: comment.product_id },
                select: {
                  id: true,
                  name: true,
                  price: true
                }
              });
              
              return {
                id: comment.comment_id, // مپ comment_id به id
                product_id: comment.product_id,
                text: comment.text,
                rating: comment.stars || 0,
                stars: comment.stars || 0, // هر دو فیلد برای سازگاری
                created_at: comment.date,
                date: comment.date, // هر دو فیلد برای سازگاری
                product_name: product?.name || null,
                product: product
              };
            } catch (productError) {
              console.error(`❌ خطا در دریافت محصول ${comment.product_id}:`, productError);
              return {
                id: comment.comment_id,
                product_id: comment.product_id,
                text: comment.text,
                rating: comment.stars || 0,
                stars: comment.stars || 0,
                created_at: comment.date,
                date: comment.date,
                product_name: `محصول #${comment.product_id}`,
                product: null
              };
            }
          }));

          console.log(`🔍 User ${user.id}: Login=${!!lastLogin}, Comments=${commentsWithProduct.length}`);

          return {
            ...user,
            login_records: lastLogin ? [lastLogin] : [],
            last_login_time: lastLogin?.login_time || null,
            comments: commentsWithProduct
          };
        } catch (dataError) {
          console.error(`❌ خطا در دریافت اطلاعات کاربر ${user.id}:`, dataError);
          return {
            ...user,
            login_records: [],
            last_login_time: null,
            comments: []
          };
        }
      }));

      // تبدیل نام‌های فیلدها برای سازگاری با frontend
      const formattedUsers = usersWithFullData.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        fullName: user.full_name,
        phone_number: user.phone_number,
        phoneNumber: user.phone_number,
        isactive: user.isactive,
        created_at: user.created_at,
        user_roles: user.user_roles,
        login_records: user.login_records,
        last_login_time: user.last_login_time,
        comments: user.comments, // ✅ نظرات کامل
        _count: {
          orders: Number(user._count.orders),
          comments: Number(user._count.comments),
          login_records: Number(user._count.login_records)
        }
      }));

      // Debug اولین کاربر
      if (formattedUsers.length > 0) {
        console.log('🔍 Sample formatted user:', {
          id: formattedUsers[0].id,
          username: formattedUsers[0].username,
          comments_count: formattedUsers[0].comments?.length || 0,
          _count_comments: formattedUsers[0]._count?.comments || 0,
          sample_comment: formattedUsers[0].comments?.[0] || null
        });
      }

      // محاسبه آمار
      const stats = {
        totalUsers: formattedUsers.length,
        activeUsers: formattedUsers.filter(u => u.isactive).length,
        inactiveUsers: formattedUsers.filter(u => !u.isactive).length,
        adminUsers: formattedUsers.filter(u => u.user_roles.some(ur => ur.roles.name === 'admin')).length
      };

      return NextResponse.json({
        success: true,
        users: formattedUsers,
        stats: stats
      });

    } catch (usersError) {
      console.error('❌ خطا در دریافت کاربران:', usersError);
      console.error('❌ Error details:', usersError.message);
      return NextResponse.json({
        success: false,
        message: 'خطا در دریافت کاربران از دیتابیس',
        error: usersError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ خطای کلی:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای داخلی سرور',
      error: error.message
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    console.log('🔍 درخواست بروزرسانی کاربر...');
    
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'لطفا وارد حساب کاربری خود شوید'
      }, { status: 401 });
    }

    const token = authorization.split(' ')[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        message: 'توکن نامعتبر است'
      }, { status: 401 });
    }
    
    const userId = decoded.userId || decoded.id;
    
    // بررسی مجوز ادمین
    const adminUser = await prisma.users.findUnique({
      where: { id: parseInt(userId) },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!adminUser || !adminUser.user_roles.some(ur => ur.roles.name === 'admin')) {
      return NextResponse.json({
        success: false,
        message: 'شما مجوز دسترسی به این بخش را ندارید'
      }, { status: 403 });
    }

    const { userId: targetUserId, action, commentId } = await request.json();

    if (action === 'toggle_status') {
      const targetUser = await prisma.users.findUnique({
        where: { id: parseInt(targetUserId) }
      });

      if (!targetUser) {
        return NextResponse.json({
          success: false,
          message: 'کاربر یافت نشد'
        }, { status: 404 });
      }

      const updatedUser = await prisma.users.update({
        where: { id: parseInt(targetUserId) },
        data: { isactive: !targetUser.isactive }
      });

      console.log(`✅ وضعیت کاربر ${targetUserId} تغییر کرد`);

      return NextResponse.json({
        success: true,
        message: 'وضعیت کاربر با موفقیت تغییر کرد',
        user: updatedUser
      });
    }

    // ✅ عملیات حذف نظر
    if (action === 'delete_comment') {
      if (!commentId) {
        return NextResponse.json({
          success: false,
          message: 'شناسه نظر نامعتبر است'
        }, { status: 400 });
      }

      try {
        // بررسی وجود نظر
        const comment = await prisma.comments.findUnique({
          where: { comment_id: parseInt(commentId) } // تغییر از id به comment_id
        });

        if (!comment) {
          return NextResponse.json({
            success: false,
            message: 'نظر یافت نشد'
          }, { status: 404 });
        }

        // حذف نظر
        await prisma.comments.delete({
          where: { comment_id: parseInt(commentId) } // تغییر از id به comment_id
        });

        console.log(`✅ نظر ${commentId} حذف شد`);

        return NextResponse.json({
          success: true,
          message: 'نظر با موفقیت حذف شد'
        });
      } catch (deleteError) {
        console.error('❌ خطا در حذف نظر:', deleteError);
        return NextResponse.json({
          success: false,
          message: 'خطا در حذف نظر',
          error: deleteError.message
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: false,
      message: 'عملیات نامعتبر'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ خطا در بروزرسانی کاربر:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای داخلی سرور',
      error: error.message
    }, { status: 500 });
  }
}

// ✅ عملیات DELETE برای حذف نظر
export async function DELETE(request) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'لطفا وارد حساب کاربری خود شوید'
      }, { status: 401 });
    }

    const token = authorization.split(' ')[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        message: 'توکن نامعتبر است'
      }, { status: 401 });
    }
    
    const userId = decoded.userId || decoded.id;
    
    // بررسی مجوز ادمین
    const adminUser = await prisma.users.findUnique({
      where: { id: parseInt(userId) },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!adminUser || !adminUser.user_roles.some(ur => ur.roles.name === 'admin')) {
      return NextResponse.json({
        success: false,
        message: 'شما مجوز دسترسی به این بخش را ندارید'
      }, { status: 403 });
    }

    const { commentId } = await request.json();

    if (!commentId) {
      return NextResponse.json({
        success: false,
        message: 'شناسه نظر نامعتبر است'
      }, { status: 400 });
    }

    // بررسی وجود نظر
    const comment = await prisma.comments.findUnique({
      where: { id: parseInt(commentId) }
    });

    if (!comment) {
      return NextResponse.json({
        success: false,
        message: 'نظر یافت نشد'
      }, { status: 404 });
    }

    // حذف نظر
    await prisma.comments.delete({
      where: { id: parseInt(commentId) }
    });

    console.log(`✅ نظر ${commentId} حذف شد`);

    return NextResponse.json({
      success: true,
      message: 'نظر با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('❌ خطا در حذف نظر:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای داخلی سرور',
      error: error.message
    }, { status: 500 });
  }
}