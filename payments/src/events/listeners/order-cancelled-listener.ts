import { Listener, NotFoundError, OrderCancelledEvent, OrderStatus, Subjects } from "@tickets_dl/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    async onMessage(data:OrderCancelledEvent['data'],msg:Message){
        const order = await Order.findOne({id:data.id, version: data.version -1 }); // to make sure that's the right order, version
        if(!order){
            throw new Error('Order not found');
        }
        order.set({status:OrderStatus.Cancelled});
        await order.save();

        msg.ack();
    };
}