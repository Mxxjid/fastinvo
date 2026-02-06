import React from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Plus, History, FileText } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    /* حذف تمام رنگ‌های لایت و استفاده از مشکی مطلق برای بدنه */
    <div
      className="flex flex-col min-h-screen bg-black text-gray-100 font-sans selection:bg-blue-500/30"
      dir="rtl"
    >
      {/* Header - شیشه‌ای تیره با حاشیه بسیار ظریف */}
      <header className="sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-white">
              FastInvo
            </span>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* محتوای اصلی */}
      <main className="flex-1 max-w-2xl mx-auto px-6 py-10 w-full space-y-4">
        
        {/* ۱. باکس بزرگ صدور فاکتور جدید - آبی درخشان در محیط تاریک */}
        <div
          onClick={() => navigate("/create-invoice")}
          className="relative overflow-hidden bg-blue-600 rounded-[25px] p-10 flex flex-col items-center text-center cursor-pointer shadow-[0_20px_50px_rgba(37,99,235,0.2)] active:scale-[0.97] transition-all group min-h-[280px] justify-center"
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/20 p-5 rounded-[30px] mb-6 backdrop-blur-md group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
              <Plus className="h-12 w-12 text-white" strokeWidth={3} />
            </div>
            <h1 className="text-3xl font-black text-white mb-3">
              صدور فاکتور جدید
            </h1>
            <p className="text-blue-100 text-sm opacity-80 font-medium">
              ایجاد فاکتور جدید در کمتر از یک دقیقه
            </p>
          </div>

          {/* افکت‌های نوری پس‌زمینه برای عمق دادن به تم تاریک */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl" />
        </div>

        {/* ۲. ردیف پایین - استفاده از خاکستری بسیار تیره برای باکس‌ها */}
        <div className="grid grid-cols-2 gap-4">
          {/* باکس تاریخچه */}
          <button
            onClick={() => navigate("/history")}
            className="bg-[#111111] p-8 rounded-[25px] border border-white/5 flex flex-col items-center text-center gap-3 active:scale-95 transition-all hover:bg-[#161616]"
          >
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <History size={28} />
            </div>
            <span className="font-black text-base text-gray-200">
              تاریخچه
            </span>
          </button>

          {/* باکس تنظیمات */}
          <button
            onClick={() => navigate("/settings")}
            className="bg-[#111111] p-8 rounded-[25px] border border-white/5 flex flex-col items-center text-center gap-3 active:scale-95 transition-all hover:bg-[#161616]"
          >
            <div className="w-14 h-14 bg-gray-500/10 rounded-2xl flex items-center justify-center text-gray-400">
              <Settings size={28} />
            </div>
            <span className="font-black text-base text-gray-200">
              تنظیمات
            </span>
          </button>
        </div>
      </main>

      {/* فوتر */}
      <footer className="py-6 text-center">
        <p className="text-[10px] text-gray-700 font-bold tracking-widest uppercase">
          Professional Invoice PWA v1.2.0
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;