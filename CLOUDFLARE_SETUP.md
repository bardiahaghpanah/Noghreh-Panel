# راه‌اندازی Noghreh Panel

این راهنما وضعیت فعلی پروژه را توضیح می‌دهد. انتشار Pages فقط رابط وب را منتشر می‌کند؛ API و D1 مراحل جداگانه دارند.

## رابط وب

GitHub Actions workflow فعلی با Secretهای `CLOUDFLARE_API_TOKEN` و `CLOUDFLARE_ACCOUNT_ID` فایل‌های ایستای ریشه را روی Cloudflare Pages منتشر می‌کند. توکن را داخل کد، فایل HTML یا چت قرار ندهید.

## API و پایگاه داده D1

۱. در Cloudflare یک پایگاه D1 با نام `noghreh-panel-db` بسازید و شناسه آن را یادداشت کنید.
۲. فایل `worker/wrangler.toml` را با شناسه واقعی D1 تنظیم کنید.
۳. از پوشه `worker` اجرا کنید:

```bash
npm install
npx wrangler d1 migrations apply noghreh-panel-db --remote
npx wrangler secret put ADMIN_TOKEN
npx wrangler deploy
```

برای `ADMIN_TOKEN` یک مقدار طولانی و تصادفی انتخاب کنید و آن را فقط در پاسخ امن Wrangler وارد کنید؛ هرگز آن را در چت یا فایل‌های پروژه ننویسید.

## وضعیت عملکرد

API شامل health check و عملیات CRUD کاربران است و اطلاعات را در D1 نگه می‌دارد. رابط فعلی هنوز به API وصل نیست. قابلیت‌های واقعی VLESS، subscription، سنجش مصرف ترافیک، محدودیت دستگاه و ورود مدیر تا تکمیل و آزمون‌های جداگانه آماده تولید نیستند. موفقیت workflow استاتیک به‌معنی آماده‌بودن این قابلیت‌ها نیست.
