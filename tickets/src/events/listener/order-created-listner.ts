import {Message} from "node-nats-streaming";
import { Listener,NotFoundError,OrderCreatedEvent, Subjects } from "@tickets_dl/common";
import { queueGroupName } from "./queueGroupName";
import { Ticket } from "../../models/tickets";
import { TicketUpdatedPublisher } from "../publishers/ticekt-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject:Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);
        // error if ticket not found
        if(!ticket){
            throw new NotFoundError();
        }
        // mark the ticket as being reserved by setting its orderId property
        ticket.set({orderId: data.id});
        // save the ticket
        await ticket.save();
        // await to make sure publish success then ack
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
    }
    
}