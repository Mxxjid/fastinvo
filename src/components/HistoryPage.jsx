import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Calendar,
  Trash2,
  Hash,
  Loader2,
} from "lucide-react";
import Dexie from "dexie";

// ۱. فراخوانی دیتابیس (دقیقاً با همان نام قبلی)
const db = new Dexie("InvoiceDB");
db.version(1).stores({
  settings: "id",
  invoices: "++id, clientName, date",
});

const HistoryPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ۲. بارگذاری فاکتورها از IndexedDB
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const savedInvoices = await db.invoices.toArray();
        // مرتب‌سازی بر اساس ID (جدیدترین در بالا)
        setInvoices(savedInvoices.sort((a, b) => b.id - a.id));
      } catch (e) {
        console.error("خطا در بارگذاری تاریخچه:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // ۳. حذف فاکتور از IndexedDB
  const deleteInvoice = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("آیا از حذف این فاکتور مطمئن هستید؟")) {
      try {
        await db.invoices.delete(id);
        // بروزرسانی استیت برای حذف از ظاهر صفحه
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      } catch (err) {
        alert("خطا در حذف فاکتور");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black text-gray-100 pb-10 font-sans selection:bg-blue-500/30"
      dir="rtl"
    >
      <header className="sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl bg-[#111111] text-gray-400 active:scale-90 transition-all"
            >
              <ArrowRight size={22} />
            </button>
            <h1 className="text-lg font-black text-white">تاریخچه فاکتورها</h1>
          </div>
          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">
              {invoices.length} فاکتور
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {invoices.length === 0 ? (
          <div className="text-center py-32 space-y-6">
            <div className="bg-[#111111] w-24 h-24 rounded-[20px] flex items-center justify-center mx-auto border border-white/5">
              <FileText size={40} className="text-gray-700" />
            </div>
            <div className="space-y-2">
              <p className="text-gray-400 font-bold text-xl">
                فاکتوری یافت نشد
              </p>
              <p className="text-gray-600 text-sm">
                شما هنوز هیچ فاکتوری در سیستم ثبت نکرده‌اید.
              </p>
            </div>
            <button
              onClick={() => navigate("/create-invoice")}
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              ساخت اولین فاکتور
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => navigate(`/edit/${inv.id}`)}
                className="bg-[#111111] p-3 rounded-[20px] border border-white/5 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-black/40 text-blue-500 rounded-2xl flex items-center justify-center border border-white/5">
                      <FileText size={22} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-white text-base leading-tight">
                        {inv.clientName || "بدون نام مشتری"}
                      </h3>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {inv.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash size={12} /> {inv.number}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => deleteInvoice(inv.id, e)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-red-500 active:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="bg-black/30 rounded-[24px] p-4 border border-white/5 flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-600 font-black uppercase block">
                      مبلغ قابل پرداخت
                    </span>
                    <p className="text-emerald-500 font-black text-xl font-mono tracking-tighter">
                      {inv.totals?.grandTotal?.toLocaleString() || 0}
                      <span className="text-[10px] mr-1.5 text-gray-600">
                        ریال
                      </span>
                    </p>
                  </div>
                  <div className="text-gray-700">
                    <span className="text-[10px] font-bold bg-white/5 px-3 py-1 rounded-lg">
                      {inv.items?.length || 0} قلم
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
