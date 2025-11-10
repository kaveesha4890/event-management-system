import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

const app = express();
dotenv.config();
connectDB();

const port = process.env.port || 3001;

app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})