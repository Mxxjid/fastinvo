import { PDFViewer } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';

const Preview = () => {
  // یک دیتای تستی بساز که شبیه دیتای اصلی فاکتورت باشد
  const dummyInvoice = {
      "number": "INV-0007",
      "date": "۱۴۰۴/۰۵/۱۶",
      "clientName": "محمد حسینی",
      "clientPhone": "09123456789",
      "clientAddress": "تهران، خیابان ولیعصر، پلاک ۱۲۳۴",
      "items": [
        {
          "name": "لپ‌تاپ Lenovo IdeaPad",
          "description": "مدل 2024 - رم ۱۶ گیگ - SSD 512",
          "unit": "عدد",
          "quantity": 1,
          "unitPrice": 42500000,
          "discountPercent": 5
        },
        {
          "name": "موس بی‌سیم Logitech",
          "description": "",
          "unit": "عدد",
          "quantity": 2,
          "unitPrice": 1200000,
          "discountPercent": 0
        }
      ],
      "taxPercent": 9,
      "overallDiscountType": "percent",
      "overallDiscountValue": 3,
      "isProforma": false,
      "paymentAccount": "IR12 3456 7890 1234 5678 9012 34",
      "paymentDescription": "مهلت پرداخت: ۷ روز پس از صدور فاکتور\nواریز به حساب بانک ملی\nتخفیف ۲٪ در صورت پرداخت نقدی",
      "generalNotes": "کالاها دارای ۱۸ ماه گارانتی معتبر هستند.\nهرگونه آسیب فیزیکی شامل گارانتی نمی‌شود.",
      "id": 1738921456789,
      "totals": {
        "subtotal": 44940000,
        "finalDiscount": 525,
        "tax": 3942180,
        "grandTotal": 47531780
      }
    }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PDFViewer width="100%" height="100%" showToolbar={false}>
        <InvoicePDF 
          invoice={dummyInvoice} 
          sellerInfo={{}} 
          totals={{ grandTotal: 200000 }} 
        />
      </PDFViewer>
    </div>
  );
};
export default Preview;
