# راه‌اندازی Noghreh Panel

پروژه دو بخش استقرار جداگانه دارد: رابط وب استاتیک و API سمت سرور.

## ۱. رابط وب

Workflow `Deploy Noghreh Panel to Cloudflare Pages` فایل‌های استاتیک را منتشر می‌کند. برای آن، این دو GitHub Actions Secret لازم‌اند:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## ۲. API و پایگاه داده D1

Workflow جدید `Deploy Noghreh API and D1` در مسیر `.github/workflows/deploy-worker.yml` هنگام تغییر فایل‌های `worker/` یا با اجرای دستی اجرا می‌شود. این workflow به‌ترتیب تلاش می‌کند Worker را مستقر کند، D1 را از روی binding پیکربندی فراهم کند، migrationهای پایگاه داده را اجرا کند و توکن مدیر را به‌صورت Worker Secret تنظیم کند.

این سه GitHub Actions Secret را از مسیر Settings → Secrets and variables → Actions در مخزن اضافه کنید:

- `CLOUDFLARE_API_TOKEN` — توکنی با مجوز لازم برای مدیریت Workers و D1 در حساب موردنظر
- `CLOUDFLARE_ACCOUNT_ID` — شناسه حساب Cloudflare
- `NOGHREH_ADMIN_TOKEN` — یک راز تصادفی و طولانی، حداقل ۳۲ نویسه؛ فقط برای احراز هویت API مدیر

مقدار واقعی هیچ‌کدام را در کد، Issues یا چت قرار ندهید. توکن Cloudflare که قبلاً در هر جای عمومی یا چت افشا شده باید لغو و با توکن تازه جایگزین شود.

پس از افزودن Secretها، از GitHub → Actions، workflow با نام `Deploy Noghreh API and D1` را با گزینه Run workflow اجرا کنید. در صورت موفقیت، خروجی اجرا و داشبورد Cloudflare را بررسی کنید تا آدرس Worker و وجود D1 تأیید شود. آدرس health check برابر `https://<worker-host>/api/health` خواهد بود؛ نام میزبان را از خروجی یا داشبورد بردارید و حدس نزنید.

## وضعیت و محدودیت‌ها

- Workflow خودکار به مخزن اضافه شده، اما هنوز در حساب Cloudflare شما اجرا و تأیید نشده است.
- رابط فعلی هنوز به API متصل نیست.
- API اولیه کاربران و ساختار D1 اضافه شده‌اند؛ VLESS واقعی، subscription سازگار با کلاینت‌ها، اندازه‌گیری واقعی ترافیک، محدودسازی دستگاه و ورود تعاملی مدیر هنوز آماده تولید نیستند.
- موفقیت استقرار Pages به معنی آماده بودن API یا قابلیت‌های VPN نیست.
