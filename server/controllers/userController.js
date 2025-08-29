
import  jwt  from "jsonwebtoken";
import User from "../models/user.js";
import bcrypt from 'bcryptjs'
import Chat from "../models/chat.js";

//Genereate JWT 
const generateToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:'30d'
    })
}

//API to register user
export const registerUser = async (req,res)=>{
    const {name,email,password} = req.body;

    try{
        const userExist = await User.findOne({email})
        if(userExist){
            return res.status(400).json({success:false,message:"User already exist"})
        }
        const user = await User.create({name,email,password})
        const token = generateToken(user._id)
         res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
    }catch(error){
        return res.json({success:false,message:error.message})
    }
}

//API TO LOGIN USER

export const loginUser = async(req,res)=>{
    const {email,password} = req.body;
    try{
       const user = await User.findOne({email}) 
       if(user){
        const isMatch = await bcrypt.compare(password,user.password)

        if(isMatch){
            const token = generateToken(user._id);
            return res.json({success:true,token})
        }
       }
       return res.json({success:false,message:"Invalid email or password"})
    }catch(error){
        return res.json({success:false,message:error.message})
    }
}

//API to get user data
export const getUser = async (req,res)=>{
    try{
        const user = req.user;
        return res.json({success:true,user})
    }catch(error){
        return res.json({success:false,message:error.message})
    }
}
// API to get published images

export const getPublishedImages = async(req,res)=>{
    try{
        const PublishedImages = await Chat.aggregate([
            {$unwind:'$messages'},
            {
                $match:{
                    "messages.isImage":true,
                    "messages.isPublished":true,
                }
            },{
                $project:{
                    _id:0,
                    imageUrl:"$messages.content",
                    userName:"$userName"
                }
            }
        ])
        res.json({success:true,images:PublishedImages.reverse()})
    }catch(error){
        return res.json({success:false,message:error.message})
    }
}
//This function fetches all messages that are images and published, selects only their URL and username, reverses the order (latest first), and returns them as a JSON response.