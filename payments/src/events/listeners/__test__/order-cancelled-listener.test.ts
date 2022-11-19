import { OrderCancelledEvent, OrderStatus } from "@tickets_dl/common";
import mongoose from "mongoose";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

it('set order status to cancel, ack is invoked', async()=>{
    
    const listener = new OrderCancelledListener(natsWrapper.client);
    // @ts-ignore
    const msg:Message = {
        ack: jest.fn()
    }
    const orderId = new mongoose.Types.ObjectId().toHexString();
    // create an order
    const order = Order.build({
        id: orderId,
        status: OrderStatus.Created,
        version: 0,
        userId:'user01',
        price:100
    });
    await order.save();

    await listener.onMessage({
        id: orderId,
        version: 1,
        ticket:{
            id:'ticketId'
        }
    }, msg);
    
    const updatedOrder = await Order.findById(orderId);
    
    expect(updatedOrder.status).toEqual(OrderStatus.Cancelled);
    expect(msg.ack).toHaveBeenCalled();

});


const setup = async () =>{
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 100,
        userId: 'user01',
        version: 0 
    })
    await order.save();
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1 ,
        ticket:{
            id: 'notImportant'
        }
    }

    // @ts-ignore
    const msg: Message ={
        ack: jest.fn()
    }

    return {listener, order, data, msg}
};

it('udpates the status of the order',async() => {
    const {listener, order, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder.status).toEqual(OrderStatus.Cancelled);

})

it('acks the message',async() => {
    const {listener, order, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})