import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import morgan from 'morgan';
import authRoute from './routes/authRoutes.js';
import eventRoute from './routes/eventRoute.js'

const app = express();
dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoute)
app.use("/api/event", eventRoute)

const PORT = process.env.PORT || 3001;

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
})