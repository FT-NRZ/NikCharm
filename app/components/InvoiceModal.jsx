'use client';
import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { HiX, HiDownload, HiPrinter } from 'react-icons/hi';

const InvoiceModal = ({ isOpen, onClose, order }) => {
  const invoiceRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `فاکتور-${order?.id}`,
  });

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`فاکتور-${order.id}.pdf`);
    } catch (error) {
      console.error('خطا در تولید PDF:', error);
      alert('خطا در تولید فایل PDF');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'در انتظار پرداخت',
      'paid': 'پرداخت شده',
      'processing': 'در حال پردازش',
      'shipped': 'در حال ارسال',
      'delivered': 'تحویل داده شده',
      'cancelled': 'لغو شده',
      'refunded': 'مرجوع شده'
    };
    return statusMap[status] || 'نامشخص';
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F2C59] to-[#1e3a8a] text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">فاکتور فروش</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
              title="چاپ فاکتور"
            >
              <HiPrinter className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
              title="دانلود PDF"
            >
              <HiDownload className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div ref={invoiceRef} className="p-8 bg-white" dir="rtl">
            
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8 border-b pb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#0F2C59] mb-2">نیک چرم</h1>
                <p className="text-[#4b5563]">فروشگاه آنلاین محصولات چرمی</p>
                <p className="text-[#4b5563]">تلفن: ۰۹۱۵۱۸۷۱۴۴۹</p>
                <p className="text-[#4b5563]">وبسایت: nikkcharm.com</p>
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-[#1f2937] mb-2">فاکتور فروش</h2>
                <p className="text-[#4b5563]">شماره فاکتور: {order.id}</p>
                <p className="text-[#4b5563]">تاریخ: {order.date}</p>
                <p className="text-[#4b5563]">وضعیت: {getStatusText(order.status)}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-8 p-4 bg-[#f9fafb] rounded-lg">
              <h3 className="text-lg font-bold text-[#1f2937] mb-3">اطلاعات مشتری</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#4b5563]"><strong>آدرس تحویل:</strong></p>
                  <p className="text-[#1f2937]">{order.delivery_address}</p>
                </div>
                <div>
                  <p className="text-[#4b5563]"><strong>کد تراکنش:</strong></p>
                  <p className="text-[#1f2937]">{order.transaction_id || 'ندارد'}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#1f2937] mb-4">جزئیات سفارش</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-[#d1d5db]">
                  <thead>
                    <tr className="bg-[#f3f4f6]">
                      <th className="border border-[#d1d5db] p-3 text-right">ردیف</th>
                      <th className="border border-[#d1d5db] p-3 text-right">نام محصول</th>
                      <th className="border border-[#d1d5db] p-3 text-center">تعداد</th>
                      <th className="border border-[#d1d5db] p-3 text-center">قیمت واحد</th>
                      <th className="border border-[#d1d5db] p-3 text-center">قیمت کل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, index) => (
                      <tr key={index} className="hover:bg-[#f3f4f6]">
                        <td className="border border-[#d1d5db] p-3 text-center">{index + 1}</td>
                        <td className="border border-[#d1d5db] p-3">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.product?.material && (
                              <p className="text-xs text-[#6b7280]">جنس: {item.product.material}</p>
                            )}
                            {item.product?.color && (
                              <p className="text-xs text-[#6b7280]">رنگ: {item.product.color}</p>
                            )}
                          </div>
                        </td>
                        <td className="border border-[#d1d5db] p-3 text-center">{item.quantity}</td>
                        <td className="border border-[#d1d5db] p-3 text-center">
                          {formatPrice(item.price)} تومان
                        </td>
                        <td className="border border-[#d1d5db] p-3 text-center font-bold">
                          {formatPrice(item.price * item.quantity)} تومان
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-start mb-8">
              <div className="w-full md:w-1/2 flex justify-end">
                <div className="bg-[#f9fafb] p-6 rounded-xl shadow text-right w-full max-w-md">
                  <div className="flex justify-between items-center mb-2">
                    <span>جمع محصولات:</span>
                    <span>{formatPrice(order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0))} تومان</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>هزینه ارسال:</span>
                    <span className="text-[#16a34a]">رایگان</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#d1d5db]">
                    <span className="font-bold text-lg">مبلغ نهایی:</span>
                    <span className="font-bold text-lg text-[#0F2C59]">
                      {formatPrice(order.total)} تومان
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-6 text-center text-[#4b5563]">
              <p>با تشکر از خرید شما</p>
              <p className="text-sm mt-2">در صورت داشتن سوال با پشتیبانی تماس بگیرید: ۰۹۱۵۱۸۷۱۴۴۹</p>
            </div>

          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-[#f9fafb] p-6 flex justify-end gap-3 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 text-[#4b5563] hover:text-[#1f2937] transition-colors rounded-lg border border-[#d1d5db]"
          >
            بستن
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2 bg-gradient-to-r from-[#0F2C59] to-[#1e3a8a] text-white rounded-lg shadow hover:from-[#0F2C59]/90 hover:to-[#1e3a8a]/90 flex items-center gap-2 border-none"
          >
            <HiDownload className="w-4 h-4" />
            دانلود PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;