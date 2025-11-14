import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'

//User signup

export const registerUser = async(req,res)=> {
    try {
        const {name, email, password, role} = req.body;

        //check all fields
        if(!name || !email || !password || !role){
            return res.status(400).json({message:"All fields are required"})
        }

        //check if user already exist
        const existedUser = await User.findOne({email});
        if(existedUser){
            return res.status(400).json({message:"User already exists"})
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password,10);

        //crete  user in db
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "participant"
        });

        return res.status(201).json({
            message:"User registed successfully",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            },
        });
    } catch (error) {
        console.error("Register Error: ",error);
        return res.status(500).json({message:"Internal server error"})
    }
}