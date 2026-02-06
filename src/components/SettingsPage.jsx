import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Save, Building, ImageIcon, Trash2, Loader2 } from "lucide-react";
import Dexie from "dexie";

// ۱. تعریف دیتابیس (می‌توانی این را در یک فایل جداگانه بگذاری و اینجا import کنی)
const db = new Dexie("InvoiceDB");
db.version(1).stores({
  settings: "id", // جدول تنظیمات که با کلید id کار می‌کند
  invoices: "++id, clientName, date" // جدول فاکتورها (برای مراجعات بعدی)
});

const SettingsPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [sellerInfo, setSellerInfo] = useState({
    id: "seller_data", // یک آیدی ثابت برای تنظیمات
    name: "",
    phone: "",
    email: "",
    officePhone: "",
    address: "",
    logo: "",
    signature: "",
  });

  // ۲. بارگذاری اطلاعات از IndexedDB به جای LocalStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await db.settings.get("seller_data");
        if (saved) {
          setSellerInfo(saved);
        }
      } catch (err) {
        console.error("خطا در بارگذاری دیتابیس:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // ۳. ذخیره اطلاعات در IndexedDB
  const handleSave = async () => {
    try {
      await db.settings.put(sellerInfo); // متد put اگر باشد آپدیت می‌کند، نباشد می‌سازد
      alert("تنظیمات در دیتابیس امن (IndexedDB) ذخیره شد");
      navigate(-1);
    } catch (err) {
      alert("خطا در ذخیره‌سازی اطلاعات");
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSellerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // چک کردن حجم فایل (اختیاری اما مفید)
    if (file.size > 2 * 1024 * 1024) {
      alert("حجم فایل نباید بیشتر از ۲ مگابایت باشد");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSellerInfo((prev) => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 pb-20 font-sans" dir="rtl">
      {/* هدر و بقیه کدها دقیقاً مثل قبل است، فقط در دکمه ذخیره handleSave فراخوانی می‌شود */}
      <header className="border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-[#111111] text-gray-400 active:scale-90 transition-all"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-black tracking-tight text-white">تنظیمات فروشنده</h1>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Save className="h-4 w-4" />
            ذخیره
          </button>
        </div>
      </header>

      {/* بقیه بدنه فرم (دقیقاً کدی که خودت فرستادی را اینجا قرار بده) */}
        <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* اطلاعات هویتی */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2 text-gray-200">
            <Building size={18} />
            <h2 className="font-black text-md uppercase tracking-[0.2em]">
              اطلاعات کسب و کار
            </h2>
          </div>

          {/* باکس اصلی با رنگ مشابه داشبورد */}
          <div className="bg-[#111111] rounded-[20px] p-3 border border-white/5 space-y-5">
            <div className="space-y-2">
              <label className="text-[12px] text-gray-500 px-3 font-bold">
                نام فروشگاه / شخص
              </label>
              <input
                type="text"
                name="name"
                value={sellerInfo.name}
                onChange={handleChange}
                placeholder="مثلاً: شرکت بازرگانی آریا"
                className="w-full px-5 py-4 bg-black/40 rounded-2xl outline-none border border-white/5 focus:border-blue-500/50 transition-all text-gray-100 placeholder:text-gray-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[12px] text-gray-500 px-3 font-bold">
                  موبایل
                </label>
                <input
                  name="phone"
                  dir="ltr"
                  value={sellerInfo.phone}
                  onChange={handleChange}
                  placeholder="0912XXXXXXX"
                  className="w-full px-5 py-4 bg-black/40 rounded-2xl outline-none border border-white/5 focus:border-blue-500/50 text-left font-mono text-gray-100"
                  style={{
                    unicodeBidi: "plaintext", // جلوگیری از پرش شماره به خاطر کاراکترهای خاص یا اینترناسیونال
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] text-gray-500 px-3 font-bold">
                  تلفن دفتر
                </label>
                <input
                  name="officePhone"
                  dir="ltr"
                  value={sellerInfo.officePhone}
                  onChange={handleChange}
                  placeholder="021XXXXXXXX"
                  className="w-full px-5 py-4 bg-black/40 rounded-2xl outline-none border border-white/5 focus:border-blue-500/50 text-left font-mono text-gray-100"
                  style={{
                    unicodeBidi: "plaintext", // تضمین می‌کند که 021 همیشه سمت چپ شماره بماند
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] text-gray-500 px-3 font-bold">
                ایمیل (اختیاری)
              </label>
              <input
                type="email"
                name="email"
                dir="ltr"
                value={sellerInfo.email}
                onChange={handleChange}
                placeholder="info@yourcompany.com"
                className="w-full px-5 py-4 bg-black/40 rounded-2xl outline-none border border-white/5 focus:border-blue-500/50 text-left font-mono text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[12px] text-gray-500 px-3 font-bold">
                نشانی کامل
              </label>
              <textarea
                name="address"
                value={sellerInfo.address}
                onChange={handleChange}
                rows={3}
                placeholder="آدرس دقیق محل کسب و کار..."
                className="w-full px-5 py-4 bg-black/40 rounded-2xl outline-none border border-white/5 focus:border-blue-500/50 resize-none text-gray-100"
              />
            </div>
          </div>
        </section>

        {/* بخش رسانه (لوگو و امضا) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2 text-gray-200">
            <ImageIcon size={18} />
            <h2 className="font-black text-md uppercase tracking-[0.2em]">
              تصاویر و مستندات
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* لوگو */}
            <div className="bg-[#111111] p-6 rounded-[20px] border border-white/5 text-center space-y-4">
              <span className="text-[10px] font-bold text-gray-500 block uppercase">
                لوگوی فروشگاه
              </span>
              <div className="relative group mx-auto w-full aspect-square bg-black/40 rounded-3xl flex items-center justify-center overflow-hidden border border-white/5">
                {sellerInfo.logo ? (
                  <>
                    <img
                      src={sellerInfo.logo}
                      alt="Logo"
                      className="w-full h-full object-contain p-4"
                    />
                    <button
                      onClick={() => setSellerInfo((p) => ({ ...p, logo: "" }))}
                      className="absolute inset-0 bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                    >
                      <Trash2 size={24} />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-3 active:bg-white/5 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "logo")}
                      className="hidden"
                    />
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <ImageIcon className="text-gray-600" size={24} />
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">
                      آپلود لوگو
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* امضا */}
            <div className="bg-[#111111] p-6 rounded-[20px] border border-white/5 text-center space-y-4">
              <span className="text-[10px] font-bold text-gray-500 block uppercase">
                مهر یا امضا
              </span>
              <div className="relative group mx-auto w-full aspect-square bg-black/40 rounded-3xl flex items-center justify-center overflow-hidden border border-white/5">
                {sellerInfo.signature ? (
                  <>
                    <img
                      src={sellerInfo.signature}
                      alt="Signature"
                      className="w-full h-full object-contain p-4"
                    />
                    <button
                      onClick={() =>
                        setSellerInfo((p) => ({ ...p, signature: "" }))
                      }
                      className="absolute inset-0 bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                    >
                      <Trash2 size={24} />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-3 active:bg-white/5 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "signature")}
                      className="hidden"
                    />
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <ImageIcon className="text-gray-600" size={24} />
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">
                      آپلود امضا
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;