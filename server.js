const express = require("express");
const bodyParser = require("body-parser");
const schedule = require("node-schedule");
const twilio = require("twilio");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Twilio setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Endpoint to schedule WhatsApp messages
app.post("/schedule", (req, res) => {
  const { message, to, time } = req.body;

  if (!message || !to || !time) {
    return res.status(400).send("Please provide 'message', 'to', and 'time'.");
  }

  const date = new Date(time);

  if (isNaN(date)) {
    return res.status(400).send("Invalid time format.");
  }

  // Schedule the message
  schedule.scheduleJob(date, () => {
    client.messages
      .create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${to}`,
        body: message,
      })
      .then((msg) => console.log("Message sent:", msg.sid))
      .catch((err) => console.error("Error:", err));
  });

  res.send(`Message scheduled for ${date}`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
