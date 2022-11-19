import {Message} from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent } from "@tickets_dl/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent>{
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
    queueGroupName = queueGroupName;
    /*
    make sure that events are only emitted to specific (queue) groups in NATS streaming
    and the event will only be sent to one of copied services (ex: order service A, order service B)
    */
    
    async onMessage(data:TicketCreatedEvent['data'], msg:Message){
        const {id,title, price} = data; // we only need these properties in order service
        const ticket = Ticket.build({
            id,title, price
        })
        await ticket.save();
        msg.ack();
    }

}