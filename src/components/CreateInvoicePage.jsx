import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowRight,
  Save,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  Percent,
  DollarSign,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import InvoicePDF from "./InvoicePDF";
import Dexie from "dexie";

// ۱. تعریف دیتابیس (مشابه فایل تنظیمات)
const db = new Dexie("InvoiceDB");
db.version(1).stores({
  settings: "id",
  invoices: "++id, clientName, date" 
});

const CreateInvoicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [sellerInfo, setSellerInfo] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [invoice, setInvoice] = useState({
    number: "",
    date: "",
    clientName: "",
    clientPhone: "",
    clientAddress: "",
    items: [],
    taxPercent: 9,
    overallDiscountType: "percent",
    overallDiscountValue: 0,
    isProforma: false,
    paymentAccount: "",
    paymentDescription: "",
    generalNotes: "",
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [currentItem, setCurrentItem] = useState({
    name: "",
    description: "",
    unit: "عدد",
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
  });

  // تابع کمکی اعداد
  const formatNumber = (val) => {
    if (!val && val !== 0) return "";
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseNumber = (val) => {
    return Number(val.toString().replace(/,/g, ""));
  };

  // ۲. بارگذاری اطلاعات از IndexedDB
  useEffect(() => {
    const loadInitialData = async () => {
      // لود اطلاعات فروشنده
      const savedSeller = await db.settings.get("seller_data");
      if (savedSeller) setSellerInfo(savedSeller);

      // لود فاکتورها برای تعیین شماره فاکتور بعدی
      const savedInvoices = await db.invoices.toArray();
      
      let nextNumber = "INV-0001";
      if (savedInvoices.length > 0) {
        const lastInvoice = savedInvoices.sort((a, b) => b.id - a.id)[0];
        const match = lastInvoice.number.match(/(\d+)/);
        if (match) {
          const lastNum = parseInt(match[1], 10);
          nextNumber = `INV-${String(lastNum + 1).padStart(4, "0")}`;
        }
      }

      // اگر در حالت ویرایش هستیم
      if (id) {
        const found = await db.invoices.get(Number(id));
        if (found) {
          setInvoice(found);
          return;
        }
      }

      // تنظیم پیش‌فرض برای فاکتور جدید
      setInvoice((prev) => ({
        ...prev,
        number: nextNumber,
        date: new Date().toLocaleDateString("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          numberingSystem: "latn",
        }),
      }));
    };

    loadInitialData();
  }, [id]);

  // ۳. محاسبه توتال (بدون تغییر)
  const totals = useMemo(() => {
    const items = invoice?.items || [];
    const subtotal = items.reduce((sum, item) => {
      const qty = Number(item?.quantity) || 0;
      const price = Number(item?.unitPrice) || 0;
      const disc = Number(item?.discountPercent) || 0;
      const itemTotal = qty * price;
      const itemDiscount = itemTotal * (disc / 100);
      return sum + (itemTotal - itemDiscount);
    }, 0);

    let finalDiscount = 0;
    const discVal = Number(invoice?.overallDiscountValue) || 0;
    if (invoice?.overallDiscountType === "percent") {
      finalDiscount = subtotal * (discVal / 100);
    } else {
      finalDiscount = discVal;
    }

    const tax = (subtotal - finalDiscount) * (Number(invoice?.taxPercent || 0) / 100);
    const grandTotal = subtotal - finalDiscount + tax;

    return { subtotal, finalDiscount, tax, grandTotal };
  }, [invoice]);

  // ۴. ثبت نهایی در IndexedDB
  const handleFinalSubmit = async () => {
    if (!invoice.clientName || (invoice.items || []).length === 0) {
      alert("لطفاً نام مشتری و حداقل یک کالا را وارد کنید.");
      return;
    }

    setIsGenerating(true);

    try {
      const sanitizeItems = (items) =>
        items.map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          discountPercent: Number(item.discountPercent) || 0,
        }));

      const finalInvoiceData = {
        ...invoice,
        items: sanitizeItems(invoice.items),
        totals,
        updatedAt: new Date().toISOString(),
      };

      // ذخیره یا آپدیت در IndexedDB
      if (id) {
        await db.invoices.update(Number(id), finalInvoiceData);
      } else {
        await db.invoices.add(finalInvoiceData);
      }

      // وقفه برای اطمینان از پایان عملیات دیتابیس در iOS
      await new Promise((resolve) => setTimeout(resolve, 150));

      // تولید PDF
      const doc = <InvoicePDF invoice={finalInvoiceData} sellerInfo={sellerInfo} />;
      const blob = await pdf(doc).toBlob();
      const fileName = `${invoice.isProforma ? "Proforma" : "Invoice"}-${invoice.clientName}.pdf`;
      
      saveAs(blob, fileName);
      navigate("/history");
    } catch (error) {
      console.error("Submission Error:", error);
      alert("خطایی رخ داد. احتمالاً حجم تصاویر بالاست یا فضای دیتابیس محدود شده است.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddItem = () => {
    if (!currentItem.name || currentItem.unitPrice <= 0) return;
    const newItems = [...(invoice?.items || [])];
    if (editingIndex !== null) {
      newItems[editingIndex] = currentItem;
    } else {
      newItems.push(currentItem);
    }
    setInvoice({ ...invoice, items: newItems });
    setIsModalOpen(false);
    setCurrentItem({ name: "", description: "", unit: "عدد", quantity: 1, unitPrice: 0, discountPercent: 0 });
    setEditingIndex(null);
  };

  return (
    // ... بقیه کدهای JSX شما (بدون تغییر در بخش UI)
<div className="min-h-screen bg-black text-gray-100 pb-40" dir="rtl">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowRight size={22} />
          </button>
          <span className="font-bold text-lg text-white">
            {id ? "ویرایش فاکتور" : "صدور فاکتور جدید"}
          </span>
          <div className="w-8"></div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-3 py-8 space-y-6">
        <div className="bg-[#111111] p-4 rounded-[28px] border border-white/5 space-y-2 shadow-xl">
          <label className="text-[10px] text-gray-200 font-black uppercase tracking-[2px] px-2 block">
            نوع سند
          </label>

          <div className="relative group">
            <select
              value={invoice.isProforma ? "proforma" : "invoice"}
              onChange={(e) =>
                setInvoice({
                  ...invoice,
                  isProforma: e.target.value === "proforma",
                })
              }
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-bold outline-none focus:border-blue-500/30 transition-all appearance-none cursor-pointer"
            >
              <option value="invoice" className="bg-[#111111] ">
                فاکتور فروش
              </option>
              <option value="proforma" className="bg-[#111111]">
پیش فاکتور              </option>
            </select>

            {/* آیکون فلش سفارشی - تراز شده برای تم جدید */}
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-blue-500 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
        {/* شماره فاکتور و تاریخ */}
        <div className="grid grid-cols-2 gap-4">
          {/* شماره سند */}
          <div className="bg-[#111111] p-4 rounded-[28px] border border-white/5 space-y-2">
            <label className="text-[10px] text-gray-200 font-black uppercase tracking-widest px-2 block">
              شماره سند
            </label>
            <input
              dir="ltr"
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-blue-500 outline-none focus:border-blue-500/30 transition-all"
              placeholder="INV-0001"
              value={invoice.number}
              onChange={(e) =>
                setInvoice({ ...invoice, number: e.target.value })
              }
            />
          </div>

          {/* تاریخ با تفکیک اتوماتیک */}
          <div className="bg-[#111111] p-4 rounded-[28px] border border-white/5 space-y-2">
            <label className="text-[10px] text-gray-200 font-black uppercase tracking-widest px-2 block">
              تاریخ صدور
            </label>
            <input
              type="text"
              dir="ltr"
              inputMode="numeric"
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-white outline-none focus:border-blue-500/30 transition-all"
              placeholder="1402/01/01"
              value={invoice.date}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, ""); // فقط اعداد را نگه دار
                if (val.length > 8) val = val.slice(0, 8); // حداکثر ۸ رقم برای تاریخ

                let formatted = val;
                if (val.length > 4 && val.length <= 6) {
                  formatted = `${val.slice(0, 4)}/${val.slice(4)}`;
                } else if (val.length > 6) {
                  formatted = `${val.slice(0, 4)}/${val.slice(4, 6)}/${val.slice(6)}`;
                }

                setInvoice({ ...invoice, date: formatted });
              }}
            />
          </div>
        </div>
        {/* اطلاعات مشتری */}
        <div className="bg-[#111111] px-4 py-2 rounded-[20px] border border-white/5 space-y-4">
          <input
            className="w-full bg-transparent border-b border-white/9 py-3 text-lg outline-none transition-all text-right text-white placeholder:text-gray-400"
            placeholder="نام مشتری..."
            value={invoice.clientName}
            onChange={(e) =>
              setInvoice({ ...invoice, clientName: e.target.value })
            }
          />
          <input
            className="w-full bg-transparent border-b border-white/9 py-3 outline-none text-sm font-mono text-gray-200 placeholder:text-gray-400"
            placeholder="شماره تلفن"
            value={invoice.clientPhone}
            dir="ltr"
            style={{
              textAlign: "right",
              unicodeBidi: "plaintext",
            }}
            onChange={(e) =>
              setInvoice({ ...invoice, clientPhone: e.target.value })
            }
          />
          <textarea
            className="w-full bg-transparent py-3 text-right outline-none text-sm text-gray-300 resize-none placeholder:text-gray-400"
            placeholder="آدرس مشتری (اختیاری)..."
            rows="2"
            value={invoice.clientAddress}
            onChange={(e) =>
              setInvoice({ ...invoice, clientAddress: e.target.value })
            }
          />
        </div>
        {/* اطلاعات پرداخت */}
        <div className="bg-[#111111] px-4 py-5 rounded-[20px] border border-white/5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-200 font-bold uppercase tracking-wider block px-1">
              شماره حساب / کارت / شبا
            </label>
            <input
              className="w-full bg-transparent border-b border-white/10 py-3 text-lg outline-none text-white placeholder:text-gray-400 font-mono"
              placeholder="مثال: IR12 3456 7890 ..."
              value={invoice.paymentAccount}
              dir="ltr" // جهت چیدمان کاراکترها از چپ به راست
              style={{
                textAlign: "right", // اما متن در سمت راست باکس نمایش داده شود
                unicodeBidi: "plaintext", // جلوگیری از جابه‌جایی گروه‌های عددی هنگام اسپیس
              }}
              onChange={(e) =>
                setInvoice({ ...invoice, paymentAccount: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-200 font-bold uppercase tracking-wider block px-1 py-1">
              توضیحات پرداخت
            </label>
            <textarea
              className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none resize-none placeholder:text-gray-400 min-h-[70px]"
              placeholder="مهلت پرداخت، نحوه واریز، تخفیف نقدی و ..."
              value={invoice.paymentDescription}
              onChange={(e) =>
                setInvoice({ ...invoice, paymentDescription: e.target.value })
              }
            />
          </div>
        </div>
        {/* لیست اقلام */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-bold text-xs text-gray-200 uppercase tracking-widest">
              اقلام فاکتور ({invoice.items?.length || 0})
            </h2>
            <button
              onClick={() => {
                setEditingIndex(null);
                setIsModalOpen(true);
              }}
              className="text-blue-500 font-bold text-sm bg-blue-500/10 px-4 py-2 rounded-xl active:scale-95 transition-all"
            >
              + افزودن ردیف
            </button>
          </div>

          {(invoice.items || []).map((item, idx) => (
            <div
              key={idx}
              className="bg-[#111111] p-4 rounded-[20px] flex justify-between items-center border border-white/5 shadow-lg"
            >
              <div className="space-y-1">
                <div className="font-bold text-white">{item.name}</div>
                <div className="text-[10px] text-gray-300 font-mono">
                  {Number(item.quantity) || 0} {item.unit} ×{" "}
                  {formatNumber(item.unitPrice)}
                </div>
              </div>
              <div className="flex items-center gap-4 text-left">
                <span className="font-mono font-bold text-emerald-500">
                  {formatNumber(
                    (Number(item.quantity) || 0) *
                      (Number(item.unitPrice) || 0) *
                      (1 - (Number(item.discountPercent) || 0) / 100),
                  )}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingIndex(idx);
                      setCurrentItem(item);
                      setIsModalOpen(true);
                    }}
                    className="text-gray-200 hover:text-blue-500"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setInvoice({
                        ...invoice,
                        items: invoice.items.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-gray-200 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* توضیحات کلی فاکتور */}
        <div className="bg-[#111111] px-4 py-5 rounded-[20px] border border-white/5">
          <label className="text-xs text-gray-200 font-bold uppercase tracking-wider block mb-3 px-1">
            یادداشت / توضیحات فاکتور
          </label>
          <textarea
            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none resize-none placeholder:text-gray-400 min-h-[100px]"
            placeholder="شرایط فروش، ضمانت، زمان تحویل، نکات مهم و ..."
            value={invoice.generalNotes}
            onChange={(e) =>
              setInvoice({ ...invoice, generalNotes: e.target.value })
            }
          />
        </div>
        {/* خلاصه مالی نهایی */}
        <div className="bg-[#111111] p-6 rounded-[20px] border border-white/5 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-200 px-2 font-bold uppercase tracking-widest">
              تخفیف کلی
            </label>
            <div className="flex items-center gap-2 p-2 bg-black/40 rounded-2xl border border-white/5 focus-within:border-blue-500/50 transition-all">
              <div className="flex bg-[#111111] p-1 rounded-xl border border-white/5 shadow-sm flex-shrink-0">
                <button
                  onClick={() =>
                    setInvoice({ ...invoice, overallDiscountType: "percent" })
                  }
                  className={`p-2 px-3 rounded-lg transition-all ${invoice.overallDiscountType === "percent" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                >
                  <Percent size={14} />
                </button>
                <button
                  onClick={() =>
                    setInvoice({ ...invoice, overallDiscountType: "amount" })
                  }
                  className={`p-2 px-3 rounded-lg transition-all ${invoice.overallDiscountType === "amount" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                >
                  <DollarSign size={14} />
                </button>
              </div>
              <input
                type="number"
                className="flex-1 bg-transparent font-mono font-bold outline-none text-left px-3 py-2 text-lg text-white"
                placeholder="0"
                value={formatNumber(invoice.overallDiscountValue)}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    overallDiscountValue: parseNumber(e.target.value),
                  })
                }
              />
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-500">
                <Percent size={16} />
                <span className="text-sm font-bold">مالیات ارزش افزوده</span>
              </div>
              <div className="flex items-center gap-2 bg-[#111111] px-3 py-1 rounded-xl border border-white/5">
                <input
                  type="number"
                  dir="ltr"
                  className="w-12 bg-transparent text-center font-mono font-bold outline-none text-white"
                  value={formatNumber(
                    invoice.taxPercent === 0 ? "" : invoice.taxPercent,
                  )}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      taxPercent: parseNumber(
                        e.target.value === "" ? 0 : Number(e.target.value),
                      ),
                    })
                  }
                />
                <span className="text-xs text-gray-200">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-dashed border-white/10 text-sm">
            <div className="flex justify-between text-gray-200">
              <span>جمع کالاها:</span>
              <span className="font-mono">{formatNumber(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-red-500/80 bg-red-500/5 p-2 rounded-xl">
              <span>تخفیف مجموع:</span>
              <span className="font-mono font-bold">
                ({formatNumber(totals.finalDiscount)}-)
              </span>
            </div>
            <div className="flex justify-between text-xl font-black pt-4 text-blue-500 border-t border-white/10">
              <span>قابل پرداخت:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-2xl tracking-tighter">
                  {formatNumber(totals.grandTotal)}
                </span>
                <span className="text-[10px] font-normal text-gray-200">
                  ریال
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* دکمه اکشن */}
      <div className="fixed bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black to-transparent z-40">
        <button
          onClick={handleFinalSubmit}
          disabled={isGenerating}
          className="mx-auto w-full max-w-xl h-16 bg-blue-600 text-white rounded-[20px] font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {isGenerating
            ? "در حال صدور..."
            : id
              ? "ثبت و آپدیت فاکتور"
              : "صدور و دریافت فاکتور"}
        </button>
      </div>

      {/* مودال ورود کالا */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${isModalOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        />
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#111111] rounded-t-[40px] p-2 border-t border-white/10 transition-transform duration-300 transform ${isModalOpen ? "translate-y-0" : "translate-y-full"}`}
        >
          <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8" />
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <input
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 outline-none text-right font-bold text-white"
              placeholder="نام کالا یا خدمات"
              value={currentItem.name}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, name: e.target.value })
              }
            />
            <textarea
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3 outline-none text-right text-xs text-gray-300 resize-none min-h-[80px]"
              placeholder="توضیحات (اختیاری)"
              rows="3"
              value={currentItem.description}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, description: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 border border-white/5 p-3 rounded-2xl">
                <label className="text-[10px] text-gray-200 px-2 block mb-1">
                  تعداد
                </label>
                <input
                  type="number"
                  dir="ltr"
                  className="w-full bg-transparent outline-none text-center font-mono text-white"
                  value={currentItem.quantity === 0 ? "" : currentItem.quantity}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      quantity:
                        e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="bg-black/40 border border-white/5 p-3 rounded-2xl">
                <label className="text-[10px] text-gray-200 px-2 block mb-1">
                  واحد
                </label>
                <input
                  className="w-full bg-transparent outline-none text-center text-white font-bold"
                  value={currentItem.unit}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, unit: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 border border-white/5 p-3 rounded-2xl">
                <label className="text-[10px] text-gray-200 px-2 block mb-1">
                  قیمت واحد (ریال)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full bg-transparent outline-none text-left font-mono text-white text-lg"
                  value={formatNumber(
                    currentItem.unitPrice === 0 ? "" : currentItem.unitPrice,
                  )}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      unitPrice: parseNumber(e.target.value),
                    })
                  }
                />
              </div>
              <div className="bg-black/40 border border-white/5 p-3 rounded-2xl">
                <label className="text-[10px] text-gray-200 px-2 block mb-1">
                  تخفیف (٪)
                </label>
                <input
                  type="number"
                  dir="ltr"
                  className="w-full bg-transparent outline-none text-left font-mono text-red-500"
                  value={
                    currentItem.discountPercent === 0
                      ? ""
                      : currentItem.discountPercent
                  }
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      discountPercent:
                        e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="bg-emerald-500/10 p-5 rounded-3xl flex justify-between items-center border border-emerald-500/20">
              <span className="text-xs text-emerald-500 font-bold">
                جمع این ردیف:
              </span>
              <span className="text-xl font-black text-emerald-500 font-mono">
                {formatNumber(
                  (Number(currentItem?.quantity) || 0) *
                    (Number(currentItem?.unitPrice) || 0) *
                    (1 - (Number(currentItem?.discountPercent) || 0) / 100),
                )}
              </span>
            </div>

            <button
              onClick={handleAddItem}
              className="w-full bg-blue-600 text-white py-5 rounded-[20px] font-bold text-lg active:scale-95 transition-all shadow-xl shadow-blue-500/10"
            >
              تایید و ثبت کالا
            </button>
          </div>
        </div>
      </div>
    </div>    
  );
};

export default CreateInvoicePage;