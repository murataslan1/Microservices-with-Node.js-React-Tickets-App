import { Publisher, Subjects, OrderCreatedEvent } from "@tickets_dl/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    readonly subject = Subjects.OrderCreated;
    

}