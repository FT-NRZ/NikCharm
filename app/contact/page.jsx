"use client";

import React, { useState } from 'react';
import { Clock, MapPin, Phone, MessageCircle, Instagram } from 'lucide-react';

// در App Router در Next.js 15, این کامپوننت باید به عنوان page تعریف شود
export default function Page() {
  const [showMap, setShowMap] = useState(false);
  
  return (
    <div dir="rtl" className="font-['Vazir', 'IRANSans', 'Tahoma'] bg-white min-h-screen">
      {/* Header با پترن خطی */}
      <div className="relative py-16 px-6 bg-[#0F2C59] text-white shadow-md overflow-hidden">
        {/* پترن‌های خطی تزئینی */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -rotate-45 top-0 right-1/4 w-96 h-96 border-t-8 border-r-8 border-white rounded-full"></div>
          <div className="absolute -rotate-12 bottom-0 left-1/3 w-80 h-80 border-b-8 border-l-8 border-white rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">راه‌های ارتباطی</h1>
          <div className="w-24 h-1 bg-white/80 mx-auto rounded-full mb-4"></div>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            ما همواره آماده پاسخگویی به سؤالات شما هستیم. از هر طریقی که راحت‌تر هستید با ما در ارتباط باشید.
          </p>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ساعات کاری */}
          <div className="rounded-2xl bg-white shadow-xl p-8 flex flex-col items-center relative overflow-hidden group">
            {/* رگه تزئینی */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0F2C59] via-[#3A5BA0] to-[#0F2C59]"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#0F2C59]/5 rounded-full transition-all duration-500 group-hover:bg-[#0F2C59]/10"></div>
            
            <div className="bg-gradient-to-br from-[#d9e2ec] to-[#EEF2F6] rounded-full p-5 mb-6 shadow-md transition-transform duration-300 group-hover:scale-110">
              <Clock className="h-8 w-8 text-[#0F2C59]" />
            </div>
            <h2 className="text-2xl font-bold mb-6 text-[#0F2C59]">ساعات کاری</h2>
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-gray-700">شنبه تا چهارشنبه:</span>
                <span className="text-[#0F2C59] font-semibold">۹ صبح - ۸ شب</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-gray-700">پنج‌شنبه:</span>
                <span className="text-[#0F2C59] font-semibold">۹ صبح - ۵ عصر</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">جمعه:</span>
                <span className="text-[#0F2C59] font-semibold">تعطیل</span>
              </div>
            </div>
          </div>

          {/* آدرس */}
          <div className="rounded-2xl bg-white shadow-xl flex flex-col items-center relative overflow-hidden group">
            {/* رگه تزئینی */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0F2C59] via-[#3A5BA0] to-[#0F2C59]"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#0F2C59]/5 rounded-full transition-all duration-500 group-hover:bg-[#0F2C59]/10"></div>
            
            {/* نمایش نقشه یا اطلاعات آدرس */}
            {showMap ? (
              <div className="w-full h-full min-h-72">
                {/* ایجاد نقشه ساده */}
                <div className="relative w-full h-full bg-gray-100 overflow-hidden">
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={() => setShowMap(false)}
                      className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0F2C59]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* تصویر نقشه */}
                  <div className="w-full h-full flex items-center justify-center text-center">
                    <div className="w-full h-full bg-[#EEF2F6]">
                      {/* پترن نقشه مانند */}
                      <div className="h-full w-full relative">
                        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
                          {Array(64).fill(0).map((_, i) => (
                            <div key={i} className="border border-gray-200"></div>
                          ))}
                        </div>
                        
                        {/* خط‌های خیابان */}
                        <div className="absolute inset-0">
                          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-300 transform -translate-y-1/2"></div>
                          <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-gray-300 transform -translate-x-1/2"></div>
                          <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2"></div>
                          <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2"></div>
                          <div className="absolute top-0 bottom-0 left-1/4 w-1 bg-gray-200 transform -translate-x-1/2"></div>
                          <div className="absolute top-0 bottom-0 left-3/4 w-1 bg-gray-200 transform -translate-x-1/2"></div>
                        </div>
                        
                        {/* نشانگر */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                          <div className="relative">
                            <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#0F2C59]/20 animate-ping"></div>
                            <div className="w-8 h-8 rounded-full bg-[#0F2C59] flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="mt-2 bg-white px-3 py-1 rounded-lg shadow-lg">
                            <p className="text-sm font-semibold text-[#0F2C59]">پاساژ ارم</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center w-full">
                <div className="bg-gradient-to-br from-[#d9e2ec] to-[#EEF2F6] rounded-full p-5 mb-6 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <MapPin className="h-8 w-8 text-[#0F2C59]" />
                </div>
                <h2 className="text-2xl font-bold mb-6 text-[#0F2C59]">آدرس</h2>
                <div className="space-y-4 text-center mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    استان خراسان شمالی، بجنورد
                    <br />
                    پاساژ ارم، طبقه +۱، پلاک ۸۴
                  </p>
                </div>
                <button 
                  onClick={() => setShowMap(true)}
                  className="flex items-center gap-2 bg-[#0F2C59] hover:bg-[#1A3D70] text-white py-3 px-6 rounded-lg transition-colors shadow-md"
                >
                  <span>مشاهده روی نقشه</span>
                  <MapPin className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* تماس با ما */}
          <div className="rounded-2xl bg-white shadow-xl p-8 flex flex-col items-center relative overflow-hidden group">
            {/* رگه تزئینی */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0F2C59] via-[#3A5BA0] to-[#0F2C59]"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#0F2C59]/5 rounded-full transition-all duration-500 group-hover:bg-[#0F2C59]/10"></div>
            
            <div className="bg-gradient-to-br from-[#d9e2ec] to-[#EEF2F6] rounded-full p-5 mb-6 shadow-md transition-transform duration-300 group-hover:scale-110">
              <Phone className="h-8 w-8 text-[#0F2C59]" />
            </div>
            <h2 className="text-2xl font-bold mb-6 text-[#0F2C59]">تماس با ما</h2>
            <div className="space-y-6 w-full">
              <a 
                href="tel:09151871449" 
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 transition-all duration-300 hover:border-[#0F2C59] hover:shadow-md group w-full"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#0F2C59]/10 flex items-center justify-center ml-3">
                    <Phone className="h-5 w-5 text-[#0F2C59]" />
                  </div>
                  <div className="text-gray-700 group-hover:text-[#0F2C59]">همراه</div>
                </div>
                <div dir="ltr" className="font-semibold text-[#0F2C59]">۰۹۱۵۱۸۷۱۴۴۹</div>
              </a>
              
              <a 
                href="tel:09355872176" 
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 transition-all duration-300 hover:border-[#0F2C59] hover:shadow-md group w-full"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#0F2C59]/10 flex items-center justify-center ml-3">
                    <Phone className="h-5 w-5 text-[#0F2C59]" />
                  </div>
                  <div className="text-gray-700 group-hover:text-[#0F2C59]">همراه</div>
                </div>
                <div dir="ltr" className="font-semibold text-[#0F2C59]">۰۹۳۵۵۸۷۲۱۷۶</div>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      
    {/* Contact Section with wave pattern */}
      <section className="relative py-16 bg-[#0F2C59] text-white overflow-hidden">
        {/* موج تزئینی */}
        <div className="absolute top-0 left-0 right-0 h-8 overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-12 text-white">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="currentColor" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
          </svg>
        </div>
        
        {/* رگه‌های تزئینی */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute rotate-12 top-1/4 right-1/4 w-64 h-64 border-2 border-white rounded-full"></div>
          <div className="absolute rotate-45 bottom-1/3 left-1/3 w-48 h-48 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl font-bold mb-10 text-center">با ما در ارتباط باشید</h2>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <a
              href="https://instagram.com/nike_leather3"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 group w-full md:w-auto"
            >
              <Instagram size={24} className="ml-4 text-white group-hover:scale-110 transition-transform duration-300" />
              <div>
                <div className="font-semibold text-lg">اینستاگرام</div>
                <div className="text-sm text-white/80">nike_leather3@</div>
              </div>
            </a>

            <a
              href="https://t.me/nike_leather_bj"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 group w-full md:w-auto"
            >
              <MessageCircle size={24} className="ml-4 text-white group-hover:scale-110 transition-transform duration-300" />
              <div>
                <div className="font-semibold text-lg">تلگرام</div>
                <div className="text-sm text-white/80">nike_leather_bj@</div>
              </div>
            </a>

            <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-4 rounded-xl w-full md:w-auto">
              <Phone size={24} className="ml-4 text-white" />
              <div>
                <div className="font-semibold text-lg">تماس</div>
                <div dir="ltr" className="text-sm text-white/80">۰۹۱۵۱۸۷۱۴۴۹</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 md:px-8 text-center">
         
        </div>
      </footer>
    </div>
  );
}