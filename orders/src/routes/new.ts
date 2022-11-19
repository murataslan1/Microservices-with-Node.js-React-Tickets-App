import express,{Request, Response} from "express";
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "@tickets_dl/common";
import {body} from "express-validator";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post('/api/orders',requireAuth,[
    body('ticketId')
      .not()
      .isEmpty()
      .withMessage('TicketId must be provided')
],async (req:Request,res:Response) => {
    const { ticketId } = req.body;

    // find the ticket that the user is trying to order in the db
    const ticket = await Ticket.findById(ticketId);
    if(!ticket){
        throw new NotFoundError();
    }

    // make sure the ticket has been reserved
    // run query to look at all orders and find an order where the ticket is the ticket we just found *and*
    // the order status is *not* cancelled
    // If we find an order from that means the ticket *is* reserved
    const isOrderReserved = await ticket.isReserved();

    if( isOrderReserved ){
        throw new BadRequestError('Ticket is already reserved');
    }

    // calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + Number(process.env.ORDER_EXPIRATION_WINDOW_SECONDS as string));

    // create the order and save it to the db
    const order = Order.build({
        userId: req.currentUser.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket: ticket
    })
    await order.save();
    // publish an event saying that an order was created
    // (need to implement order-created-evnet in common module)
    const orderCreatedPublisher = new OrderCreatedPublisher(natsWrapper.client);
    await orderCreatedPublisher.publish({
        id: order.id,
        version: order.version,
        status: order.status,
        userId:order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket:{
            id:order.ticket.id,
            price:order.ticket.price
        }

    })


    res.status(201).send(order);
})

export {router as newOrderRouter};