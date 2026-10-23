# Noghreh Panel

A clean, independent Persian RTL administration-panel starter with an AMOLED-inspired interface.

## Current scope

- Persian (RTL) responsive admin dashboard UI
- User and subscription overview with sample data
- Client-side QR-code/config preview scaffold
- Clear separation between the admin UI and any real connection infrastructure

## Important limitations

This repository is an independent implementation. It does not copy ZEUS Panel source code or assets.

The current starter is a front-end prototype: it does **not** create real V2Ray/VLESS/Trojan connections, provision servers, meter traffic, or securely persist user accounts. Do not put secrets or production user data in the browser. Real connection services require a separately hosted, supported backend and infrastructure. Cloudflare Workers alone are not a V2Ray server, and deployments must comply with Cloudflare's current terms.

## Run locally

Open `index.html` in a modern browser. No build step is required for this UI prototype.

## Next steps

1. Add authenticated backend endpoints and a persistent database.
2. Add server-side authorization, audit logs, and input validation.
3. Integrate a separately hosted connection-management service only after selecting compliant infrastructure.
4. Replace all sample data and demo QR/config values before production.

## License

Project license and third-party dependency notices should be selected and reviewed before public redistribution.