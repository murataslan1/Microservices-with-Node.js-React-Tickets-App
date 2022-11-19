import {Listener} from "./base-listener";
import {Message} from "node-nats-streaming";
import { TicketCreatedEvent } from "./ticket-created-event";
// import { Subjects } from "./subjects";
import { Subjects } from "./subjects";


export class TicketCreatedListener extends Listener<TicketCreatedEvent>{
    readonly subject = Subjects.TicketCreated;
    //  to make sure we don't change this.subject in the future
    queueGroupName = 'payments-service';

    onMessage(data:TicketCreatedEvent['data'], msg:Message){
        // implement some bussiness logic
        console.log("# TicketCreatedListener ",data)

        msg.ack();
    }
}