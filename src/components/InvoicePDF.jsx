import React from "react";
import { Document, Page, Text, View, Image, Font } from "@react-pdf/renderer";
import VazirFont from "../assets/Vazirmatn-Medium.ttf"; // مسیر فایل فونت شما

// ثبت فونت برای استفاده در PDF
Font.register({
  family: "Vazir",
  src: VazirFont,
});

const InvoicePDF = ({ invoice, sellerInfo }) => {
  const seller = sellerInfo || {};
  const totals = invoice?.totals || {};
  const isProforma = invoice?.isProforma;

  // ۱. تابع تبدیل ارقام به فارسی
  const toFarsiNumber = (n) => {
    if (n === undefined || n === null) return "";
    const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return n.toString().replace(/\d/g, (x) => farsiDigits[x]);
  };

  // ۲. تابع فرمت مبالغ و اعداد (جداکننده هزارگان + فارسی‌سازی)
  const f = (num) => {
    if (num === undefined || num === null || num === "")
      return toFarsiNumber("0");
    const formatted = Math.round(num).toLocaleString("en-US");
    return toFarsiNumber(formatted);
  };

  return (
    <Document
      title={`${isProforma ? "Pre" : ""}Invoice-${invoice?.clientName}`}
    >
      <Page
        size="A4"
        style={{
          padding: 35,
          fontFamily: "Vazir",
          backgroundColor: "#FFFFFF",
          fontSize: 9,
          color: "#000000",
        }}
      >
        {/* عنوان سند */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          {isProforma ? "پیش‌ فاکتور فروش" : "فاکتور فروش "}
        </Text>

        {/* ۱. هدر (لوگو راست - اطلاعات وسط - فاکتور چپ) */}
        <View
          style={{
            flexDirection: "row-reverse",
            justifyContent: "space-between",
            alignItems: "center", // تغییر از flex-start به center برای هم‌تراز شدن افقی
            marginBottom: 20,
            borderBottomWidth: 1.5,
            borderBottomColor: "#000",
            paddingBottom: 15,
            minHeight: 80, // یک ارتفاع حداقل برای پایداری بصری
          }}
        >
          {/* ۱. بخش سمت راست: لوگو (تراز شده به راست) */}
          <View style={{ width: "25%", alignItems: "flex-end" }}>
            {seller.logo ? (
              <Image
                src={seller.logo}
                style={{ width: 80, height: 80, objectFit: "contain" }}
              />
            ) : (
              <View style={{ width: 70, height: 70 }} /> // نگه داشتن فضا حتی اگر لوگو نباشد
            )}
          </View>

          {/* ۲. بخش وسط: اطلاعات برند (تراز شده به مرکز) */}
          <View style={{ width: "50%", alignItems: "center", gap: 2 }}>
            {seller.name && (
              <Text style={{ fontSize: 15, fontWeight: "bold", color: "#000" }}>
                {seller.name}
              </Text>
            )}
            {seller.address && (
              <Text
                style={{
                  fontSize: 8,
                  textAlign: "center",
                  maxWidth: "90%",
                  color: "#444",
                }}
              >
                {seller.address}
              </Text>
            )}
              {seller.officePhone && (
              <View style={{ flexDirection: "row-reverse", gap: 4 }}>
                <Text style={{ fontSize: 8, color: "#444" }}>
                  {"  "}: تلفن دفتر
                </Text>
                <Text style={{ fontSize: 8, color: "#444" }}>
                  {toFarsiNumber(seller.officePhone)}
                </Text>
              </View>
            )}
            {seller.phone && (
              <View style={{ flexDirection: "row-reverse", gap: 4 }}>
                <Text style={{ fontSize: 8, color: "#444" }}>{"  "}:تلفن</Text>
                <Text style={{ fontSize: 8, color: "#444" }}>
                  {toFarsiNumber(seller.phone)}
                </Text>
              </View>
            )}
          
          </View>

          {/* ۳. بخش سمت چپ: شماره و تاریخ (تراز شده به چپ) */}
          <View style={{ width: "25%", alignItems: "flex-start", gap: 5,paddingRight:50, }}>
            <View
              style={{
                flexDirection: "row-reverse",
                justifyContent: "space-between",
                width: "100%",
                paddingHorizontal: 5,
                borderBottomWidth: 0.5, // یک خط ظریف برای تفکیک بهتر
                borderBottomColor: "#eee",
                paddingBottom: 2,
              }}
            >
              <Text style={{ fontSize: 8 }}>:شماره</Text>
              <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                {invoice?.number || "---"}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row-reverse",
                justifyContent: "space-between",
                width: "100%",
                paddingHorizontal: 5,
              }}
            >
              <Text style={{ fontSize: 8 }}>:تاریخ</Text>
              <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                {toFarsiNumber(invoice?.date) || "---"}
              </Text>
            </View>
          </View>
        </View>

        {/* ۲. اطلاعات خریدار */}
        <View
          style={{
            marginBottom: 15,
            padding: 10,
            borderWidth: 1,
            borderColor: "#000",
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "bold",
              marginBottom: 6,
              textAlign: "center",
              borderBottomWidth: 0.5,
              paddingBottom: 3,
            }}
          >
            مشخصات خریدار
          </Text>

          {/* خط اول: نام مشتری */}
          <View style={{ flexDirection: "row-reverse", marginBottom: 4 }}>
            <Text style={{ fontSize: 9 }}>{"  "}:صورتحساب </Text>
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
              {invoice?.clientName || "---"}
            </Text>
          </View>

          {/* خط دوم: ترکیب آدرس و تلفن */}
          <View
            style={{
              flexDirection: "row-reverse",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              borderTopWidth: 0.5,
              borderTopColor: "#eee",
              paddingTop: 4,
            }}
          >
            {/* بخش آدرس - از سمت راست */}
            <View
              style={{ flexDirection: "row-reverse", flex: 1, paddingLeft: 10 }}
            >
              <Text style={{ fontSize: 9, whiteSpace: "nowrap" }}>
                {"  "}:نشانی{" "}
              </Text>
              <Text style={{ fontSize: 9, textAlign: "right" }}>
                {invoice?.clientAddress || "---"}
              </Text>
              <Text> / </Text>
              <Text style={{ fontSize: 9 }}>{"  "}:تلفن </Text>
              <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                {toFarsiNumber(invoice?.clientPhone) || "---"}
              </Text>
            </View>

            {/* بخش تلفن - چسبیده به سمت چپ */}
            {/* <View style={{ flexDirection: "row-reverse", }}>
  
    </View> */}
          </View>
        </View>

        {/* ۳. جدول اقلام */}
        <View>
          <View
            style={{
              flexDirection: "row-reverse",
              backgroundColor: "#000",
              padding: 6,
            }}
          >
            <Text
              style={{ width: "5%", color: "#fff", textAlign: "center" }}
            ></Text>
            <Text
              style={{
                width: "35%",
                color: "#fff",
                textAlign: "right",
                paddingRight: 5,
              }}
            >
              شرح کالا / خدمات
            </Text>
            <Text style={{ width: "12%", color: "#fff", textAlign: "center" }}>
              تعداد
            </Text>
            <Text style={{ width: "18%", color: "#fff", textAlign: "center" }}>
              قیمت واحد
            </Text>
            <Text style={{ width: "10%", color: "#fff", textAlign: "center" }}>
              تخفیف
            </Text>
            <Text style={{ width: "20%", color: "#fff", textAlign: "center" }}>
              جمع نهایی
            </Text>
          </View>

          {invoice?.items?.map((item, i) => {
            const rowSubtotal = (item.quantity || 0) * (item.unitPrice || 0);
            const rowDiscount =
              rowSubtotal * ((item.discountPercent || 0) / 100);
            return (
              <View
                key={i}
                wrap={false}
                style={{
                  flexDirection: "row-reverse",
                  borderBottomWidth: 1,
                  borderBottomColor: "#000",
                  paddingVertical: 6,
                  alignItems: "center",
                }}
              >
                <Text style={{ width: "5%", textAlign: "center" }}>
                  {toFarsiNumber(i + 1)}
                </Text>
                <View
                  style={{ width: "35%", textAlign: "right", paddingRight: 5 }}
                >
                  <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                  {item.description && (
                    <Text style={{ fontSize: 7, color: "#444" }}>
                      {item.description}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    width: "12%",
                    flexDirection: "row-reverse",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <Text>{toFarsiNumber(item.quantity)}</Text>
                  <Text style={{ fontSize: 7 }}>{item.unit}</Text>
                </View>
                <Text style={{ width: "18%", textAlign: "center" }}>
                  {f(item.unitPrice)}
                </Text>
                <Text style={{ width: "10%", textAlign: "center" }}>
                  {item.discountPercent > 0
                    ? `%${toFarsiNumber(item.discountPercent)}`
                    : "---"}
                </Text>
                <Text
                  style={{
                    width: "20%",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {f(rowSubtotal - rowDiscount)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ۴. خلاصه مالی و پرداخت */}
        <View style={{ flexDirection: "row-reverse", marginTop: 20, gap: 15 }}>
          <View
            style={{
              flex: 1,
              padding: 8,
              borderWidth: 1,
              borderColor: "#000",
              borderRadius: 4,
              textAlign: "right",
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 5 }}>
              جزئیات پرداخت
            </Text>
            {invoice?.paymentAccount && (
              <View
                style={{
                  flexDirection: "row-reverse", // حیاتی برای چیدمان راست به چپ
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                  width: "100%", // اطمینان از اینکه کل عرض باکس را می‌گیرد
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                  :حساب/شبا
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    fontFamily: "Vazir", // اطمینان از اعمال فونت برای اعداد
                    textAlign: "left", // شماره شبا بهتر است از چپ تراز باشد
                  }}
                >
                  {toFarsiNumber(invoice.paymentAccount)}
                </Text>
              </View>
            )}
            <Text
              style={{
                fontSize: 8,
                lineHeight: 1.4,
                borderTopWidth: 0.5,
                paddingTop: 4,
                borderStyle: "dashed",
              }}
            >
              {invoice?.paymentDescription || ""}
            </Text>
          </View>

          <View
            style={{
              width: 200,
              borderWidth: 1,
              borderColor: "#000",
              padding: 8,
              borderRadius: 4,
            }}
          >
            <View
              style={{
                flexDirection: "row-reverse",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <Text>جمع کل</Text>
              <Text>{f(totals?.subtotal)}</Text>
            </View>

            {totals?.finalDiscount && (
              <View
                style={{
                  flexDirection: "row-reverse",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text>تخفیف فاکتور</Text>
                <Text>({f(totals?.finalDiscount)}-)</Text>
              </View>
            )}

            <View
              style={{
                flexDirection: "row-reverse",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text>مالیات ({toFarsiNumber(invoice?.taxPercent)}%)</Text>
              <Text>{f(totals?.tax)}+</Text>
            </View>
            <View
              style={{
                flexDirection: "row-reverse",
                justifyContent: "space-between",
                backgroundColor: "#000",
                padding: 6,
                marginHorizontal: -8,
                bottom: 0,
                position: "absolute",
                width: "100%",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                قابل پرداخت
              </Text>
              <View style={{ flexDirection: "row-reverse", gap: 2 }}>
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 11 }}
                >
                  {f(totals?.grandTotal)}
                </Text>
                <Text style={{ color: "#fff", fontSize: 7 }}>ریال</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ۵. یادداشت‌ها */}
        {invoice?.generalNotes && (
          <View
            style={{
              marginTop: 15,
              padding: 8,
              borderRightWidth: 3,
              borderRightColor: "#000",
              textAlign: "right",
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 2 }}>
              :توضیحات
            </Text>
            <Text style={{ fontSize: 8, lineHeight: 1.5 }}>
              {invoice.generalNotes}
            </Text>
          </View>
        )}

        {/* ۶. فوتر و امضا */}
        <View style={{ marginTop: "auto", paddingTop: 10 }}>
          {seller.signature ? (
            <View
              style={{
                flexDirection: "row-reverse",
                justifyContent: "space-around",
                marginTop: 10,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  width: 150,
                  borderTopWidth: 1,
                  paddingTop: 5,
                }}
              >
                <Text
                  style={{ fontSize: 9, fontWeight: "bold", marginBottom: 5 }}
                >
                  مهر و امضای فروشنده
                </Text>
                <Image
                  src={seller.signature}
                  style={{ width: 90, height: 45, objectFit: "contain" }}
                />
              </View>
              <View
                style={{
                  alignItems: "center",
                  width: 150,
                  borderTopWidth: 1,
                  paddingTop: 5,
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                  تایید و امضای خریدار
                </Text>
                <View style={{ height: 45 }} />
              </View>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
