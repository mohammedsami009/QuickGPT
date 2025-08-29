//API Controller for creating a new chat

import Chat from "../models/chat.js"

export const createChat = async(req,res)=>{
    try {
        const userId = req.user._id

        const chatData = {
            userId,
            messages:[],
            name:"New Chat",
            userName:req.user.name
        }
        await Chat.create(chatData)
        res.json({success:true,message:"Chat created"})
    } catch (error) {
        res.json({success:false,message:error.message});
        
    }
}

//API CONTOLLER FOR GETTING ALL CHATS

export const getChat = async(req,res)=>{
    try {
        const userId = req.user._id

        const chats = await Chat.find({userId}).sort({updatedAt:-1})

        
        res.json({success:true,chats})
    } catch (error) {
        res.json({success:false,message:error.message});
        
    }
}

//API Controller for deleting a chat

export const deleteChat = async(req,res)=>{
    try {
        const userId = req.user._id
        const {chatId} = req.body
        
        console.log('Deleting chat:', chatId, 'for user:', userId)
        
        const result = await Chat.deleteOne({_id:chatId,userId})
        
        if (result.deletedCount === 0) {
            return res.json({success:false, message:"Chat not found or not authorized"})
        }
        
        res.json({success:true, message:"Chat deleted successfully"})
    } catch (error) {
        console.error('Delete chat error:', error)
        res.json({success:false,message:error.message});
    }
}