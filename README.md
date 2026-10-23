# Noghreh Panel

پنل مستقل فارسی با رابط RTL و تم تیره. مخزن به‌صورت مرحله‌ای از نمونه رابط کاربری به پنل دارای API و پایگاه داده تبدیل می‌شود.

## وضعیت فعلی

- رابط وب فارسی و واکنش‌گرا در `index.html`
- API مستقل Cloudflare Worker در `worker/src/index.js`
- ساختار پایگاه داده D1 برای کاربران، اشتراک‌ها و گزارش رویدادها
- API مدیریت کاربران با احراز هویت Bearer Token، اعتبارسنجی ورودی و ثبت رویدادهای مدیریتی

## محدودیت مهم

این commit زیرساخت اولیه API و ذخیره‌سازی را اضافه می‌کند؛ هنوز رابط فعلی به API متصل نشده و هنوز هسته اتصال واقعی VLESS، تولید subscription سازگار با کلاینت‌ها، اندازه‌گیری واقعی ترافیک، محدودسازی دستگاه و ورود تعاملی مدیر کامل نشده است. هیچ داده نمایشی را داده واقعی کاربران فرض نکنید. Worker به‌تنهایی بدون پیاده‌سازی و آزمون پروتکل، سرویس VPN آماده محسوب نمی‌شود.

## API

تمام مسیرهای زیر به‌جز health نیاز به هدر `Authorization: Bearer <ADMIN_TOKEN>` دارند:

- `GET /api/health` — بررسی اتصال D1
- `GET /api/users` — فهرست کاربران (حداکثر ۵۰۰ مورد)
- `POST /api/users` — ساخت کاربر؛ بدنه نمونه:
  ```json
  {"name":"کاربر آزمایشی","email":"user@example.com","traffic_limit_gb":100,"device_limit":2,"expires_at":"2027-01-01T00:00:00.000Z"}
  ```
- `GET /api/users/:id` — دریافت کاربر
- `PATCH /api/users/:id` — ویرایش فیلدهای کاربر
- `DELETE /api/users/:id` — حذف کاربر
- `GET /api/audit` — صد رویداد مدیریتی اخیر

وضعیت‌های مجاز کاربر: `active`، `disabled`، `expired`. برای API توکن مدیر را فقط به‌صورت Worker Secret ذخیره کنید؛ هرگز در `index.html`، مخزن عمومی یا چت قرار ندهید. برای استفاده عمومی باید CORS به دامنه پنل محدود، احراز هویت قوی‌تر، محدودسازی درخواست و مدیریت امن نشست اضافه شود.

## راه‌اندازی توسعه

نیازمند Node.js و Wrangler است. ابتدا یک پایگاه D1 بسازید، شناسه واقعی آن را در `worker/wrangler.toml` قرار دهید و migration را اجرا کنید:

```bash
cd worker
npm install
npx wrangler d1 create noghreh-panel-db
npx wrangler d1 migrations apply noghreh-panel-db --remote
npx wrangler secret put ADMIN_TOKEN
npx wrangler deploy
```

فرمان ساخت D1 شناسه را برمی‌گرداند؛ مقدار `database_id` در فایل پیکربندی باید با آن جایگزین شود. برای توسعه محلی از `npx wrangler dev` استفاده کنید.

## استقرار خودکار API و D1

Workflow جدید `.github/workflows/deploy-worker.yml` هنگام تغییر فایل‌های `worker/` یا اجرای دستی، تلاش می‌کند Worker را مستقر کند، منبع D1 را از روی binding پیکربندی فراهم کند، migrationها را اجرا کند و `ADMIN_TOKEN` را به‌صورت Worker Secret تنظیم کند. این فرایند فقط پس از تنظیم سه GitHub Actions Secret زیر قابل اجراست: `CLOUDFLARE_API_TOKEN`، `CLOUDFLARE_ACCOUNT_ID` و `NOGHREH_ADMIN_TOKEN`. توکن مدیر باید حداقل ۳۲ نویسه باشد. مجوزهای Cloudflare باید اجازه مدیریت Workers و D1 را بدهند.

این workflow هنوز به‌صورت زنده در حساب Cloudflare اجرا و تأیید نشده است؛ ممکن است برای حساب یا مجوزهای مشخص نیاز به اصلاح داشته باشد. Workflow رابط Pages موجود و این workflow برای Worker دو استقرار جداگانه‌اند. اسرار Cloudflare را فقط در GitHub Actions Secrets یا Worker Secrets قرار دهید.

این پروژه مستقل است و از کد یا دارایی‌های پروژه‌های دیگر کپی نمی‌کند. مجوز انتشار نهایی و اعلان وابستگی‌های ثالث باید پیش از انتشار عمومی مشخص شوند.
