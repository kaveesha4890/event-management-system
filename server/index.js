import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import morgan from 'morgan';
import userRoute from './routes/authRoutes.js';

const app = express();
dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/user", userRoute)

const PORT = process.env.PORT || 3001;

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
})