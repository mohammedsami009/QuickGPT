import express from 'express'
import { protect } from '../middlewares/auth.js'
import { getPlans, purchaseplan } from '../controllers/creditController.js'

const creditRouter = express.Router()

creditRouter.get('/plan',getPlans)
creditRouter.post('/purchase',protect,purchaseplan)


export default creditRouter