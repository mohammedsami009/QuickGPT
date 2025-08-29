//Text-based AI Chat Message Controller

import axios from "axios"
import Chat from "../models/chat.js"
import User from "../models/user.js"
import openai from "../config/openai.js"
import imagekit from "../config/imageKit.js"

export const textMessageController = async(req, res) => {
    try {
        const userId = req.user._id

        if(req.user.credits < 1) {
            return res.json({success: false, message: "You don't have enough credits to use this feature"})
        }

        const {chatId, prompt} = req.body
        
        // Add validation for required fields
        if(!chatId || !prompt) {
            return res.status(400).json({success: false, message: "Chat ID and prompt are required"})
        }

        const chat = await Chat.findOne({userId, _id: chatId})
        
        // Add validation for chat existence
        if(!chat) {
            return res.status(404).json({success: false, message: "Chat not found"})
        }

        chat.messages.push({role: "user", content: prompt, timestamp: Date.now(), isImage: false})

        // Using object destructuring to directly extract `choices` 
        // from the API response instead of writing response.choices
        // (cleaner and shorter syntax) gemini-2.0-flash
        const { choices } = await openai.chat.completions.create({
            model: "gemini-2.0-flash", // or your chosen model
            messages: [{ role: "user", content: prompt }],
        });

        // Spread operator (...) copies all key-value pairs from choices[0].message 
        // into reply, then we add timestamp and isImage fields on top.
        const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false };
        
        // Fixed typo: sucess -> success
        res.json({success: true, reply})
        
        chat.messages.push(reply)
        await chat.save()

        await User.updateOne({_id: userId}, {$inc: {credits: -1}})

    } catch (error) {
        console.error('Text message controller error:', error)
        res.status(500).json({success: false, message: error.message})
    }
}

//Image Generation Message Controller
export const imageMessageController = async(req, res) => {
    try {
        const userId = req.user._id;
        
        //check credits
        if(req.user.credits < 2) {
            return res.json({success: false, message: "You don't have enough credits to use this feature"})
        }
        
        const {prompt, chatId, isPublished} = req.body

        // Add validation for required fields
        if(!chatId || !prompt) {
            return res.status(400).json({success: false, message: "Chat ID and prompt are required"})
        }

        //Find chat
        const chat = await Chat.findOne({userId, _id: chatId})
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        //Push user message
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false
        });

        //Encode the prompt
        const encodedPrompt = encodeURIComponent(prompt)

        //Construct Imagkit AI generation URL
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/${Date.now()}.png?tr=w-800,h-800`;

        //Trigger generation by fetching from imagekit
        const aiImageResponse = await axios.get(generatedImageUrl, { responseType: "arraybuffer" });

        //Convert to BASE64
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString('base64')}`
        
        // You're taking the raw AI-generated image,
        // Converting it to Base64 text,
        // Wrapping it in a Data URI,
        // So you can directly send it in the API response and render it in the frontend.

        //upload to Imagekit Media Library
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "QUICKGPT"
        })

        const reply = {role: 'assistant', content: uploadResponse.url, timestamp: Date.now(), isImage: true, isPublished}
        res.json({success: true, reply})

        chat.messages.push(reply)
        await chat.save()

        await User.updateOne({_id: userId}, {$inc: {credits: -2}})

    } catch (error) {
        console.error('Image message controller error:', error)
        res.status(500).json({success: false, message: error.message})
    }
}