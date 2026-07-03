# Decisions - Climbing Training PWA

## DEC-01: Static Single Page Application (SPA)
* **Context**: Low budget, Netlify hosting, target audience of 10-20 athletes. Minimal backend footprint.
* **Decision**: Implement the MVP using standard HTML5, ES6 Modules JavaScript, and Vanilla CSS, running entirely in the client.
* **Consequence**: Zero compilation overhead, fast client load times, easy hosting.

## DEC-02: Isolated Mock Data Service (`db.js`)
* **Context**: Supabase Postgres and Auth will be integrated later.
* **Decision**: Implement a clean mock service API returning Promises that resolves mock data. It saves changes to `localStorage` to simulate persistence.
* **Consequence**: Frontend can be written as if calling asynchronous network APIs. Swapping to Supabase in Phase 5 will only require modifying `db.js`.

## DEC-03: External Media Hosting (Google Drive / Telegram)
* **Context**: Native video uploads are bandwidth, storage, and processing intensive.
* **Decision**: Instruct users to upload videos to Google Drive or Telegram, then input the URLs into the request form.
* **Consequence**: Keeps the app lightweight, simple, and completely free to host.

## DEC-04: Simplified Manual Billing (Direct Bank Link / QR)
* **Context**: Avoiding complex subscription pipelines, merchant account verifications, and compliance overhead.
* **Decision**: Show static payment details (direct savings account details or a payment QR code) inside the app's Profile / Access status tab.
* **Consequence**: Coaches receive funds directly, keeping transaction processing cost-free and avoiding implementation complexity.

## DEC-05: Basic Client Reminders & Status Tracking
* **Context**: The coach requires notifications about client updates and active access states.
* **Decision**: Build simplified client status tables and lightweight inline reminders on the dashboard instead of setting up a complex, bloated third-party CRM system.
* **Consequence**: Minimizes codebase bloat, keeping dashboard navigation simple.
