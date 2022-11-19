import express, {Request, Response} from "express";
import {body} from "express-validator";
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from "@tickets_dl/common";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";

const router = express.Router();

router.post('/api/payments',requireAuth, [
    body('token').not().isEmpty().withMessage('token should not be emtpy'),
    body('orderId').not().isEmpty().withMessage('order id should not be empty')
],
validateRequest,
  async(req: Request, res: Response) => {    
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);
    if(!order){
        throw new NotFoundError();
    }
    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError();
    }
    if(order.status === OrderStatus.Cancelled){
        throw new BadRequestError('Cannot pay for an cancelled order')
    }

    // handle payments

    const charge = await stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100, // cents
        source: token
    });
    // stripe id can used to retrieve a charge with stripe charges retrieve API
    const payment = new Payment({
        orderId: orderId,
        version: 0,
        stripeId: charge.id
    })
    await payment.save();

    res.status(201).send({success: true});
})


export { router as createChargeRouter };




