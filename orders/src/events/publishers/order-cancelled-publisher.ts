import { Publisher, Subjects, OrderCancelledEvent } from "@tickets_dl/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    readonly subject = Subjects.OrderCancelled;
    

}