import { NotAuthorizedError, NotFoundError, requireAuth } from "@tickets_dl/common";
import express,{Request, Response} from "express";
import { Order } from "../models/order";


const router = express.Router();


router.get('/api/orders/:orderId', requireAuth ,async (req:Request,res:Response) => {
    const { orderId } = req.params
    const order = await Order.findById(orderId).populate('ticket');

    if(!order){
        console.log("# order not found")
    }
    if( order.userId !== req.currentUser!.id){

        throw new NotAuthorizedError();
    }

    res.send(order);
})

export {router as showOrderRouter};