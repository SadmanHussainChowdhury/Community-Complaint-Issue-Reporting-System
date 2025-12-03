# Twilio SMS Setup Guide

This guide will help you configure Twilio for SMS functionality in the Community Complaint System.

## Prerequisites

1. A Twilio account (sign up at https://www.twilio.com)
2. A Twilio phone number (purchased from Twilio)
3. Your Twilio Account SID and Auth Token

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## Getting Your Twilio Credentials

1. **Account SID and Auth Token:**
   - Log in to your Twilio Console (https://console.twilio.com)
   - Navigate to Account → Account Info
   - Copy your Account SID and Auth Token

2. **Phone Number:**
   - Go to Phone Numbers → Manage → Active Numbers
   - Copy your Twilio phone number (format: +1234567890)
   - If you don't have a number, purchase one from Twilio

## Installation

After adding the environment variables, install the Twilio package:

```bash
npm install
```

The `twilio` package is already included in `package.json`.

## Testing

1. Go to Admin Panel → SMS and Email Bulk
2. Select "SMS Only" as message type
3. Choose your recipients
4. Compose a message (max 160 characters)
5. Click "Send SMS"

## Notes

- SMS messages are limited to 160 characters
- If Twilio is not configured, the system will log messages to the console instead of sending
- Make sure your Twilio account has sufficient credits
- Phone numbers must be in E.164 format (e.g., +1234567890)

## Troubleshooting

### SMS Not Sending
- Verify your Twilio credentials are correct
- Check that your Twilio account has credits
- Ensure phone numbers are in E.164 format
- Check server logs for error messages

### Twilio Not Configured
- The system will work without Twilio (for email-only functionality)
- SMS sending will be logged to console instead
- Configure Twilio to enable SMS functionality
