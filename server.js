const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

async function saveMessage(entry) {
  try {
    let data = [];
    try {
      const raw = await fs.readFile(MESSAGES_FILE, 'utf8');
      data = JSON.parse(raw || '[]');
    } catch (err) {
      // file may not exist yet
      data = [];
    }
    data.push(entry);
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving message', err);
  }
}

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email and message are required' });
  }

  const entry = { name, email, message, date: new Date().toISOString() };

  // persist (best-effort)
  saveMessage(entry);

  // send email if SMTP configured
  let emailResult = null;
  if (process.env.SMTP_HOST && process.env.CONTACT_TO_EMAIL) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.CONTACT_TO_EMAIL,
        subject: `Website contact from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`
      };

      emailResult = await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error('Email send failed', err);
    }
  }

  // send SMS if Twilio configured
  let smsResult = null;
  if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_FROM && process.env.CONTACT_TO_PHONE) {
    try {
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      smsResult = await client.messages.create({
        body: `New contact from ${name}: ${message.slice(0, 160)}`,
        from: process.env.TWILIO_FROM,
        to: process.env.CONTACT_TO_PHONE
      });
    } catch (err) {
      console.error('SMS send failed', err);
    }
  }

  res.json({ success: true, emailSent: !!emailResult, smsSent: !!smsResult });
});

app.listen(PORT, () => {
  console.log(`Contact API listening on port ${PORT}`);
});