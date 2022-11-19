import { Publisher, Subjects, TicketUpdatedEvent } from "@tickets_dl/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    readonly subject = Subjects.TicketUpdated;
    

}