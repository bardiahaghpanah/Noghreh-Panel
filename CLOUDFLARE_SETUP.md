# راه‌اندازی خودکار Noghreh-Panel روی Cloudflare Pages

این راهنما استقرار نسخه فعلی پنل وب را توضیح می‌دهد. این کار پنل را روی اینترنت منتشر می‌کند؛ به‌تنهایی سرور V2Ray/VLESS نمی‌سازد و بخش فعلی مدیریت کاربران هنوز نمونه نمایشی است.

## ۱. ساخت API Token در Cloudflare

1. وارد داشبورد Cloudflare شوید و از بخش My Profile → API Tokens یک توکن بسازید.
2. از قالب Custom token استفاده کنید و فقط دسترسی‌های لازم برای Pages را بدهید. دسترسی نوشتن Cloudflare Pages برای حساب موردنظر لازم است. دسترسی‌های اضافی را فعال نکنید.
3. توکن را فقط در GitHub Secrets ذخیره کنید؛ آن را داخل فایل‌های پروژه یا پیام چت قرار ندهید.

ممکن است نام دقیق مجوزها در رابط Cloudflare تغییر کند. اگر استقرار به‌علت مجوز رد شد، پیام خطای Wrangler را بررسی کنید و فقط مجوز لازم را اضافه کنید.

## ۲. پیدا کردن Account ID

در داشبورد Cloudflare، حساب موردنظر را باز کنید و Account ID را از بخش اطلاعات حساب یا صفحه Overview کپی کنید. این شناسه با API Token فرق دارد.

## ۳. افزودن Secrets در GitHub

به این مسیر بروید:

GitHub → bardiahaghpanah/Noghreh-Panel → Settings → Secrets and variables → Actions → New repository secret

دو Secret زیر را جداگانه اضافه کنید:

- CLOUDFLARE_API_TOKEN — مقدار API Token ساخته‌شده در Cloudflare
- CLOUDFLARE_ACCOUNT_ID — مقدار Account ID حساب Cloudflare

مقادیر محرمانه را در کد، README، Issues یا چت قرار ندهید.

## ۴. اجرای استقرار

پس از افزودن هر دو Secret، به زبانه Actions بروید و workflow با نام Deploy Noghreh Panel to Cloudflare Pages را از طریق Run workflow اجرا کنید؛ یا یک commit جدید روی شاخه main بفرستید.

نام پروژه Pages در workflow برابر noghreh-panel است. در صورت موفقیت، آدرس سایت معمولاً به شکل زیر خواهد بود:

https://noghreh-panel.pages.dev

آدرس نهایی را از خروجی job یا داشبورد Cloudflare تأیید کنید.

## وضعیت و محدودیت‌های فعلی

- این workflow برای استقرار فایل‌های ایستای وب است.
- توکن Cloudflare باید مجوز مناسب داشته باشد و Account ID درست باشد.
- برای ورود امن مدیر، ذخیره‌سازی واقعی، API سمت سرور و مدیریت واقعی V2Ray به پیاده‌سازی جداگانه نیاز است.
- هرگز API Token را در مرورگر یا در کد فرانت‌اند قرار ندهید.
