import { OrderCreatedEvent, OrderStatus, TicketCreatedEvent } from "@tickets_dl/common";
import mongoose from "mongoose";
import { Ticket, TicketsAttrs } from "../../../models/tickets";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listner";
import {Message} from "node-nats-streaming";


it('is triggered while ticket is reserved and contains correct order id', async () => {
    // create OrderCaretdEventListener
    const listener = new OrderCreatedListener(natsWrapper.client);
    // create a ticket
    const ticketData:TicketsAttrs = {
        title: 'test title',
        price:100,
        userId:new mongoose.Types.ObjectId().toHexString()
    }
    const ticket = Ticket.build(ticketData);
    await ticket.save();

    // make an order
    const orderData:OrderCreatedEvent['data']  = {
        id: new mongoose.Types.ObjectId().toHexString(), // orderId
        version:0, // not sure
        status: OrderStatus.Created,
        userId: ticket.userId,
        expiresAt: new Date().toDateString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
         
    }
    // @ts-ignore
    const msg: Message ={
        ack: jest.fn()
    }
    await listener.onMessage(orderData, msg)
    // make assertion that msg is called
    expect(msg.ack).toHaveBeenCalled();
    // make assertion that orderId is equal to the orderData
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket.orderId).toEqual(orderData.id)
});


const setup = async () => {
    // create an instance of the OderCreatedListener
    const listener = new OrderCreatedListener(natsWrapper.client);
    
    // create and save a ticket
    const ticket = Ticket.build({
        title: 'test ticket',
        price: 100,
        userId: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    // create the mock data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(), // orderId
        version: 0,
        status: OrderStatus.Created,
        userId: ticket.userId,
        expiresAt: new Date().toDateString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, ticket, data, msg}
};

it('acks the message',async() => {
    const {listener, ticket, data, msg} = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket.orderId).toEqual(data.id);
});

it('sets the userId of the ticket',async() => {
    const {listener, ticket, data, msg} = await setup();
    await listener.onMessage(data,msg);
    expect(msg.ack).toHaveBeenCalled();
});

it('publishs a ticket updated event', async () =>{
    const {listener, ticket, data, msg} = await setup();
    await listener.onMessage(data,msg);  
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    // from base-publisher
    expect(ticketUpdatedData.orderId).toEqual(data.id);
});