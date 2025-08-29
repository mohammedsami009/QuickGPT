import Stripe from 'stripe'
import Transaction from '../models/transaction.js';
import User from '../models/user.js'

export const stripeWebHooks = async(req,res)=>{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const sig = request.headers["stripe-signature"]

    let event;
    try{
        event = stripe.webhooks.constructEvent(req.body,sig,process.env.STRIPE_WEBHOOK_SECRET)
    }catch(error){
        return res.status(400).send(`webhook Error: ${error.message}`)  
    }
    try{
        switch(event.type){
            case "payment_intent.succeeded":{
                const paymentIntent = event.data.object;
                const sessionList = await stripe.checkout.list({
                    payment_intent: paymentIntent.id,
                })

                const session = sessionList.data[0];
                const {transactionID,appId} = session.metadata;

                if(appId === 'quickgpt'){
                    const transaction = await Transaction.findOne({_id:transactionID,isPaid:false})
                     //update credits in user accout

                await User.updateOne({_id:transaction.userId},{$inc:{credits:transaction.credits}})

                //update credit payment status
                transaction.isPaid = true;
                await transaction.save();
                }else{

                    return res.json({recieved:true,message:"Ignored event: Invalid app"})
                }
                break;
            
            }
            default:
                console.log("Unhandled event type:",event.type)
                break;
        }
        res.json({recieved:true})

    }catch(error){
        console.error("webhook processing error:",error)
        res.status(500).send("Internal server error")
    }
}
