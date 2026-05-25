# EmailJS Setup for The Board FC

Follow these steps to set up EmailJS for sending match notifications to players:

## 1. Create an EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/) and sign up for an account
2. Verify your email address

## 2. Add an Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Select your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps

## 3. Create an Email Template

1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Design your template with the following variables:
   - `{{to_name}}` - Player's full name
   - `{{to_email}}` - Player's email address
   - `{{subject}}` - Email subject line
   - `{{message}}` - The notification message
   - `{{team_name}}` - Team name (The Board FC)

## 4. Get Your Configuration Details

1. Find your "Service ID" in the Email Services section
2. Find your "Template ID" in the Email Templates section
3. Get your "Public Key" from the Account > API Keys section

## 5. Update Configuration

Update the `src/config/emailjs.ts` file with your details:

```typescript
export const emailConfig = {
  serviceId: 'your_service_id', 
  templateId: 'your_template_id',
  publicKey: 'your_public_key',
};
```

## Template Example

Here's a simple template example for your emails:

```html
<!DOCTYPE html>
<html>
<head>
  <title>{{subject}}</title>
</head>
<body>
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #004d98;">{{team_name}}</h2>
    </div>
    
    <div style="margin-bottom: 20px;">
      <p>Hello {{to_name}},</p>
      <p>{{message}}</p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
      <p>This is an automated notification from The Board FC team management system.</p>
    </div>
  </div>
</body>
</html>
``` 