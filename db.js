import { Schema, connect, model } from "mongoose"
import dotenv from 'dotenv';
dotenv.config();

const connectDb = async()=>{
    try {
        await connect(process.env.MONGO_URI)
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

const accountCreationSchema = new Schema({
    email: String,
    createdAt: { type: Date, default: Date.now }
});

const AccountCreation = model('AccountCreation', accountCreationSchema);

export { connectDb, AccountCreation };