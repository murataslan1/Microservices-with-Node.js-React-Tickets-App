import {  OrderCreatedEvent, OrderStatus } from "@tickets_dl/common";
import mongoose from "mongoose";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";

it('builds an order with given id, ack',async()=>{
    // init listener instance
    const listener = new OrderCreatedListener(natsWrapper.client);
    // data
    const userId = new mongoose.Types.ObjectId().toHexString();
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticketId = new mongoose.Types.ObjectId().toHexString();
    const data:OrderCreatedEvent['data'] ={
        id: orderId,
        version: 0,
        status: OrderStatus.Created,
        userId: userId,
        expiresAt: new Date().toISOString(),
        ticket: {
            id: ticketId,
            price: 100,
        }
    }
    // mock msg
    // @ts-ignore
    const msg:Message={
        ack: jest.fn()
    }
    // emit event
    await listener.onMessage(data, msg);
    // check ack
    expect(msg.ack).toHaveBeenCalled();
    // check data is idential 
    const order = await Order.findById(data.id)
    expect(order.id).toEqual(data.id);
    // 
});

const setup = async() => {
    const listener = new OrderCreatedListener(natsWrapper.client);
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version:0,
        expiresAt: new Date().toISOString(),
        userId: 'user01',
        status: OrderStatus.Created,
        ticket:{
            id: new mongoose.Types.ObjectId().toHexString(),
            price:100,
        }
    };
    // @ts-ignore
    const msg:Message = {
        ack : jest.fn()
    }

    return { listener, data, msg }
};

it('replicates the order info',async () =>{
    const { listener, data, msg } = await setup(); 
    await listener.onMessage(data, msg);
    const order = await Order.findById(data.id);
    expect(data.id).toEqual(order.id);
    expect(data.ticket.price).toEqual(order.price);

});

it('acks the message',async () =>{
    const { listener, data, msg } = await setup(); 
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();

});

