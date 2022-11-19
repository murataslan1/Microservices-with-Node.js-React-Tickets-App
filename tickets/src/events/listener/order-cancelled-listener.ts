import { Listener, NotFoundError, OrderCancelledEvent, OrderStatus, Subjects } from "@tickets_dl/common";
import { queueGroupName } from "./queueGroupName";
import {Message} from "node-nats-streaming";
import { Ticket } from "../../models/tickets";
import { TicketUpdatedPublisher } from "../publishers/ticekt-updated-publisher";


export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    
    async onMessage(data: OrderCancelledEvent['data'],msg:Message){
        const ticket = await Ticket.findById(data.ticket.id);
        if(!ticket){
            throw new NotFoundError();
        }
        ticket.set({status: OrderStatus.Cancelled, orderId: undefined});
        await ticket.save();
        
        await new TicketUpdatedPublisher(this.client).publish({  
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId
        });
        // ack the message
        msg.ack();
    };

}