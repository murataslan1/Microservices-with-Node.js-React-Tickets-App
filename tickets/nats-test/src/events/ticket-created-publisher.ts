import { Publisher } from "./base-publisher";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatePublisher extends Publisher<TicketCreatedEvent>{
    readonly subject = Subjects.TicketCreated;
}