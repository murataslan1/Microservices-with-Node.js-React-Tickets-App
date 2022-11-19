import { Publisher, Subjects, TicketCreatedEvent } from "@tickets_dl/common"

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    readonly subject = Subjects.TicketCreated;
    

}