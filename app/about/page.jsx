"use client";

import { Instagram, MessageCircle, Phone } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#0F2C59]" dir="rtl">
      
      {/* Hero Section با پترن‌های خطی سفید روی زمینه سورمه‌ای */}
      <section className="relative py-24 bg-[#0F2C59] overflow-hidden">
        {/* پترن‌های خطی تزئینی */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -rotate-45 top-0 right-1/4 w-96 h-96 border-t-8 border-r-8 border-white rounded-full"></div>
          <div className="absolute -rotate-12 bottom-0 left-1/3 w-80 h-80 border-b-8 border-l-8 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-white text-5xl md:text-6xl font-bold mb-6">چرم نیک</h1>
          <p className="text-white/90 text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            صنایع دستی چرم با کیفیت استثنایی، ساخته شده با عشق و هنر
          </p>
          <div className="w-20 h-1 bg-white/80 mx-auto rounded-full"></div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-24 px-6 md:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          
          {/* Right Content */}
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold text-[#0F2C59] mb-6">درباره ما</h2>
            <div className="w-16 h-1 bg-[#0F2C59] mb-8 rounded-full"></div>
            
            <div className="space-y-6 text-lg">
              <p className="leading-relaxed text-gray-700">
                به دنیای هنرمندانه <span className="font-bold text-[#0F2C59]">چرم نیک</span> خوش آمدید. ما با افتخار، هر محصول را با دست‌های ماهر هنرمندان ایرانی خلق می‌کنیم تا میراث کهن چرم‌دوزی را با نگاهی مدرن زنده نگه داریم.
              </p>
              <p className="leading-relaxed text-gray-700">
                فلسفه ما در چرم نیک ساده است: استفاده از مرغوب‌ترین چرم‌های طبیعی و تکنیک‌های سنتی دوخت برای خلق آثاری ماندگار که با گذر زمان، نه تنها کهنه نمی‌شوند، بلکه شخصیت و زیبایی منحصر به فردی پیدا می‌کنند.
              </p>
              <p className="leading-relaxed text-gray-700">
                هر محصول چرم نیک، داستانی از هنر، صبر و عشق به کیفیت را با خود به همراه دارد - داستانی که با شما ادامه می‌یابد.
              </p>
            </div>
          </div>

          {/* Left Image with decorative elements */}
          <div className="md:w-1/2 relative">
            <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-105">
              {/* تصویر اصلی با گرادیانت */}
              <div className="w-full h-96 bg-gradient-to-br from-[#0F2C59] to-[#3A5BA0] flex items-center justify-center p-8">
                <div className="text-white text-center">
                  <h3 className="text-3xl font-bold mb-4">صنایع دستی زیبا</h3>
                  <p className="text-lg mb-6">هر محصول داستان منحصر به فرد خود را دارد</p>
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-2xl font-light">چ</span>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center mx-2">
                      <span className="text-2xl font-light">ر</span>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-2xl font-light">م</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* رگه‌های تزئینی */}
            <div className="absolute -top-6 -right-6 w-32 h-32 border-4 border-[#0F2C59] rounded-lg opacity-20 z-0"></div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 border-4 border-[#0F2C59] rounded-lg opacity-20 z-0"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-[#0F2C59] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F2C59]/5 rounded-full -mr-16 -mt-16 group-hover:bg-[#0F2C59]/10 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#0F2C59]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#0F2C59]/20 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#0F2C59]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#0F2C59]">کیفیت برتر</h3>
              <p className="text-gray-600">استفاده از بهترین چرم‌های طبیعی با دوام فوق‌العاده برای اطمینان از عمر طولانی محصولات</p>
            </div>
          </div>
          
          <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-[#0F2C59] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F2C59]/5 rounded-full -mr-16 -mt-16 group-hover:bg-[#0F2C59]/10 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#0F2C59]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#0F2C59]/20 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#0F2C59]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#0F2C59]">دست‌دوز</h3>
              <p className="text-gray-600">هر محصول با دقت و ظرافت به صورت دستی توسط هنرمندان ماهر تولید می‌شود</p>
            </div>
          </div>
          
          <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-[#0F2C59] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F2C59]/5 rounded-full -mr-16 -mt-16 group-hover:bg-[#0F2C59]/10 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#0F2C59]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#0F2C59]/20 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#0F2C59]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#0F2C59]">طراحی منحصربفرد</h3>
              <p className="text-gray-600">ترکیب هنر سنتی و طراحی مدرن برای خلق محصولاتی که زیبایی و کاربرد را با هم دارند</p>
            </div>
          </div>
        </div>
      </section>

    
    </div>
  );
}