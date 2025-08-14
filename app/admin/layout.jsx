// کل فایل layout.jsx را با این جایگزین کن:

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { HiOutlineViewGrid, HiOutlinePlus, HiOutlinePencilAlt, HiChevronDown, HiOutlineHome } from "react-icons/hi";

export default function AdminLayout({ children }) {
  const [openProducts, setOpenProducts] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* منوی موبایل */}
      <div className="lg:hidden fixed top-0 right-0 left-0 z-40 bg-white/95 shadow">
        <div className="flex items-center justify-center px-4 py-3">
          <button
            className="w-full max-w-xs flex items-center justify-between bg-blue-600 text-white rounded-xl px-4 py-3 font-extrabold text-lg tracking-tight drop-shadow"
            onClick={() => setMobileMenu((prev) => !prev)}
          >
            داشبورد مدیریت
            <HiChevronDown className={`transition-transform duration-300 ml-2 ${mobileMenu ? "rotate-180" : ""}`} size={22} />
          </button>
        </div>
        {mobileMenu && (
          <div className="absolute right-0 left-0 top-[60px] z-50 bg-white rounded-b-2xl shadow-2xl m-4 p-4 animate-slideDown">
            <nav className="flex flex-col gap-4">
              {/* گزینه خانه بالای منو موبایل */}
              <SidebarLink
                href="/"
                icon={<HiOutlineHome size={20} />}
                active={pathname === "/"}
                onClick={() => setMobileMenu(false)}
              >
                خانه
              </SidebarLink>
              
              <div>
                <button
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-right transition-all duration-300 hover:bg-blue-100 hover:text-blue-700 text-gray-700 cursor-pointer w-full relative"
                  onClick={() => setOpenProducts((prev) => !prev)}
                >
                  <HiOutlineViewGrid size={22} />
                  مدیریت محصولات
                  <HiChevronDown
                    size={18}
                    className={`transition-transform duration-300 ml-auto ${openProducts ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`flex flex-col gap-4 pr-6 mt-2 transition-all duration-300 overflow-hidden ${
                    openProducts ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {/* زیرمنوهای مدیریت محصولات */}
                  <SidebarLink
                    href="/admin/dashboard"
                    icon={<HiOutlineViewGrid size={20} />}
                    active={pathname === "/admin/dashboard"}
                    onClick={() => setMobileMenu(false)}
                  >
                    تمام محصولات
                  </SidebarLink>
                  <SidebarLink
                    href="/admin/createProduct"
                    icon={<HiOutlinePlus size={20} />}
                    active={pathname === "/admin/createProduct"}
                    onClick={() => setMobileMenu(false)}
                  >
                    ایجاد محصول جدید
                  </SidebarLink>
                  <SidebarLink
                    href="/admin/EditProduct"
                    icon={<HiOutlinePencilAlt size={20} />}
                    active={pathname === "/admin/EditProduct"}
                    onClick={() => setMobileMenu(false)}
                  >
                    ویرایش محصولات
                  </SidebarLink>
                  <SidebarLink
                    href="/admin/editSlider"
                    icon={<HiOutlinePencilAlt size={20} />}
                    active={pathname === "/admin/editSlider"}
                    onClick={() => setMobileMenu(false)}
                  >
                    ویرایش اسلایدر
                  </SidebarLink>
                  <SidebarLink
                    href="/admin/createCategory"
                    icon={<HiOutlinePlus size={20} />}
                    active={pathname === "/admin/createCategory"}
                    onClick={() => setMobileMenu(false)}
                  >
                    افزودن دسته‌بندی
                  </SidebarLink>
                  <SidebarLink
                    href="/admin/editCategory"
                    icon={<HiOutlinePencilAlt size={20} />}
                    active={pathname === "/admin/editCategory"}
                    onClick={() => setMobileMenu(false)}
                  >
                    ویرایش دسته‌بندی
                  </SidebarLink>
                </div>
              </div>
              
              {/* مدیریت کاربران در منوی موبایل */}
              <SidebarLink
                href="/admin/Users"
                icon={<HiOutlineViewGrid size={20} />}
                active={pathname === "/admin/Users"}
                onClick={() => {
                  setMobileMenu(false);
                  setOpenProducts(false);
                }}
              >
                مدیریت کاربران
              </SidebarLink>
            </nav>
          </div>
        )}
        <style>{`
          @keyframes slideDown {
            from { transform: translateY(-24px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slideDown { animation: slideDown 0.25s cubic-bezier(.4,2,.6,1) both; }
        `}</style>
      </div>

      {/* منوی دسکتاپ */}
      <div className="min-h-screen flex flex-row bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-16 lg:pt-0">
        <aside
          dir="rtl"
          className="w-80 bg-white border-r-4 border-blue-200 shadow-2xl flex-col py-8 px-4 sticky top-0 h-screen z-20 transition-all duration-500 hidden lg:flex overflow-y-auto"
          style={{
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(6px)"
          }}
        >
          {/* گزینه خانه بالای منو دسکتاپ */}
          <div className="mb-4 flex justify-start">
            <SidebarLink
              href="/"
              icon={<HiOutlineHome size={20} />}
              active={pathname === "/"}
            >
              خانه
            </SidebarLink>
          </div>
          
          <h2 className="text-2xl font-extrabold text-blue-700 mb-6 text-center tracking-tight drop-shadow">داشبورد مدیریت</h2>
          
          <nav className="flex flex-col gap-4 flex-1">
            <div className="space-y-4">
              <button
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-right transition-all duration-300 hover:bg-blue-100 hover:text-blue-700 text-gray-700 cursor-pointer w-full relative"
                onClick={() => setOpenProducts((prev) => !prev)}
              >
                <HiOutlineViewGrid size={22} />
                مدیریت محصولات
                <HiChevronDown size={18} className={`transition-transform duration-300 ml-auto ${openProducts ? "rotate-180" : ""}`} />
              </button>
              
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openProducts ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-col gap-2 pr-6">
                  <SidebarLink
                    href="/admin/dashboard"
                    icon={<HiOutlineViewGrid size={20} />}
                    active={pathname === "/admin/dashboard"}
                  >
                    تمام محصولات
                  </SidebarLink>
                  <SidebarLink
                    href="/admin/createProduct"
                    icon={<HiOutlinePlus size={20} />}
                    active={pathname === "/admin/createProduct"}
                  >
                    ایجاد محصول جدید
                  </SidebarLink>
                  <SidebarLink
                    href="/admin/EditProduct"
                    icon={<HiOutlinePencilAlt size={20} />}
                    active={pathname === "/admin/EditProduct"}
                  >
                    ویرایش محصولات
                  </SidebarLink>
                  <SidebarLink
                    href="/admin/editSlider"
                    icon={<HiOutlinePencilAlt size={20} />}
                    active={pathname === "/admin/editSlider"}
                  >
                    ویرایش اسلایدر
                  </SidebarLink>
                  <SidebarLink
                    href="/admin/createCategory"
                    icon={<HiOutlinePlus size={20} />}
                    active={pathname === "/admin/createCategory"}
                  >
                    افزودن دسته‌بندی
                  </SidebarLink>
                  <SidebarLink
                    href="/admin/editCategory"
                    icon={<HiOutlinePencilAlt size={20} />}
                    active={pathname === "/admin/editCategory"}
                  >
                    ویرایش دسته‌بندی
                  </SidebarLink>
                </div>
              </div>
            </div>
            
            {/* مدیریت کاربران در منوی دسکتاپ */}
            <div className="mt-4">
              <SidebarLink
                href="/admin/Users"
                icon={<HiOutlineViewGrid size={20} />}
                active={pathname === "/admin/Users"}
                onClick={() => setOpenProducts(false)}
              >
                مدیریت کاربران
              </SidebarLink>
            </div>
          </nav>
        </aside>
        <main dir="rtl" className="flex-1 p-8">{children}</main>
      </div>
    </>
  );
}

// کامپوننت لینک سایدبار
function SidebarLink({ href, icon, children, active, onClick }) {
  return (
    <Link href={href} className="group" onClick={onClick}>
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-right
        transition-all duration-300 cursor-pointer relative overflow-hidden shadow-sm mb-1
        ${active ? "bg-blue-600 text-white" : "hover:bg-blue-100 hover:text-blue-700 text-gray-700"}
      `}>
        <span className="transition-transform duration-300 group-hover:scale-110">{icon}</span>
        <span className="transition-all duration-300 group-hover:pr-2">{children}</span>
        {active && (
          <span className="absolute right-0 top-0 h-full w-1 bg-blue-400 rounded-l-xl transition-transform duration-300 origin-top"></span>
        )}
      </div>
    </Link>
  );
}