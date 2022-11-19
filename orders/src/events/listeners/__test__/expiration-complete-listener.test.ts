import { ExpirationCompleteEvent } from "@tickets_dl/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import { Order, OrderStatus } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";

it('should have an expired order in cancelled status',async()=>{
    // create a new ticket
    const userId = new mongoose.Types.ObjectId().toHexString();

    const ticket = new Ticket({
        title:'test',
        price:100,
        version: 0
    })
    await ticket.save()
    // create a new order on that ticket
    const order = Order.build({
        userId: userId,
        status: OrderStatus.Created,
        expiresAt: new Date(),  // create an epxired order
        ticket: ticket
    })
    await order.save();

    // expiration complete listener onMessage should be called
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    const listener = new ExpirationCompleteListener(natsWrapper.client);
    await listener.onMessage({orderId: order.id},msg);
    
    const updatedOrder = await Order.findById(order.id);
    // Order cancelled event should be triggered
    expect(msg.ack).toHaveBeenCalled();
    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);

});

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'test',
        price: 100,
    })
    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId:'user01',
        expiresAt: new Date(),
        ticket       
    })
    await order.save();

    const data:ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    // @ts-ignore
    const msg:Message = {
        ack: jest.fn()
    };

    return {msg, data, order,listener,ticket}
};

it('updates the order status to cancelled', async() =>{
    const {listener, order ,msg, data} = await setup();
    await listener.onMessage(data, msg);

    const udpatedOrder = await Order.findById(order.id);
    expect(udpatedOrder.status).toEqual(OrderStatus.Cancelled);
});


it('emit an OrderCancelled event', async() =>{
    const {listener, order ,msg, data} = await setup();
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
    expect(eventData.id).toEqual(order.id);
});


it('ack the message', async() =>{
    const {listener, order ,msg, data} = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});