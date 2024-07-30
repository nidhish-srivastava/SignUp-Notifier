# SignUp-Notifier

A tiny monitoring tool which will email you about new signups in your applications.Upon 5 new signups or more it will send you a mail and every week it will send you email about all the new account creations in that week.

## Features

- **Webhook Integration:** Utilizes webhooks to receive notifications about new account creations.
- **Email Notification:** Sends email notifications using Nodemailer when a threshold of new account creations is reached.
- **Scheduled Emails:** Sends a weekly summary email of new account creations using cron jobs.
