import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cron from "node-cron"
dotenv.config();
import {connectDb,AccountCreation} from "./db.js"
const app = express();
app.use(express.json());
const PORT = 5000 || process.env.PORT;
connectDb()

const sendEmail = async(subject,text)=>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: subject,
        text: text
    };

   
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
}

app.post('/webhook', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: 'error', error: 'Email is required' });
    }
    try {
        await new AccountCreation({ email }).save();
        const count = await AccountCreation.countDocuments();
        if(count>=5){
            const accounts = await AccountCreation.find()
            const emails = accounts.map((account)=>account.email)
            const subject = 'Batch Account Creation Notification';
            const text = `The following new accounts have been created:\n${emails.join('\n')}`;
            await sendEmail(subject, text);
            await AccountCreation.deleteMany();
        }
        res.status(200).json({ status: 'success', message: 'Account creation recorded' });
    } catch (error) {
        console.error('Error processing webhook: ', error);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

const processWeeklyEmail = async () => {
    try {
        const accounts = await AccountCreation.find();
        if (accounts.length > 0) {
            const emails = accounts.map(account => account.email);

            const subject = 'Weekly Account Creation Notification';
            const text = `The following new accounts have been created this week:\n${emails.join('\n')}`;
            await sendEmail(subject, text);

            await AccountCreation.deleteMany(); // Reset the collection
        }
    } catch (error) {
        console.error('Error sending weekly email: ', error);
    }
};

cron.schedule('0 0 * * 0', processWeeklyEmail);  // midnight every sunday

// Endpoint to manually trigger the cron job
app.post('/trigger-cron', async (req, res) => {
    await processWeeklyEmail();
    res.send('Cron job manually triggered');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
