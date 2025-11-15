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
        console.error("Register Error: ", error);
        return res.status(500).json({message:"Internal server error"})
    }
}

//user login
export const loginUser = async(req,res) => {
    try {
        const {email, password} = req.body;

        //check fields
        if(!email || !password){
            return res.status(400).json({message:"Email and password required"});
        }

        //find user by email
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        //compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid password"})
        }

        //create JWT token
        const token = jwt.sign(
            {
                id: user._id,
                role:user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );
        return res.status(200).json({
            message:"Login successful",
            token,
            user:{
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
        });
    } catch (error) {
        console.error("Login Error: ", error);
        res.status(500).json({message:"Internal server error"})
    }
}