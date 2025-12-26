# Tenuunihjim

Tenuun Contact Backend & Frontend Integration

This project adds a simple Express backend that accepts contact form submissions and optionally sends an email (via SMTP) and an SMS (via Twilio). Messages are also saved to `messages.json`.

## Setup

1. Install dependencies:

   npm install

2. Copy `.env.example` to `.env` and fill your credentials:

   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL
   - Optionally: TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, CONTACT_TO_PHONE

3. Start the server:

   npm start

The server listens on `PORT` (default 3000) and exposes `POST /api/contact`.

## Frontend

`index.html` includes a contact form that POSTs to `/api/contact` and shows success/error messages.

## Notes

- Ensure your SMTP credentials are correct. For Gmail, use an App Password or OAuth.
- Twilio requires a verified from-number and destination number when on trial accounts.
- Messages are saved to `messages.json` in the project root.

