import {Message} from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@tickets_dl/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent>{
    subject:Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;
    async onMessage(data: TicketUpdatedEvent['data'], msg: Message){
        const ticket = await Ticket.findByEvent(data)
        if(!ticket){
            // if event is processed in incorrect order (version is not matched)
            throw new Error('Ticket not found');
        }
        const {title, price} = data;
        ticket.set({title,price});
        await ticket.save();

        msg.ack();
        
    }
}