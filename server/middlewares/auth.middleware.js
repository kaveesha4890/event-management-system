import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async(req,res,next) => {
    try {
        const token = req.header.authorization?.split(" ")[1];

        if(!token){
            return res.status(401).json({message:"No token provided"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        next();
    } catch (error) {
        console.error("Auth Error: ", error);
        return res.status(401).json({message: "Invalid or expired token"})
    }
}

export const roleMiddleware = (requiredRole) => {
    return (req,res,next) => {
        if(req.user.role !== requiredRole){
            return res.status(403).json({message: "Access denied"});
        }
        next();
    }
}