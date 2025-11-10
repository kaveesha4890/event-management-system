import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const port = process.env.port || 3001;

app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})