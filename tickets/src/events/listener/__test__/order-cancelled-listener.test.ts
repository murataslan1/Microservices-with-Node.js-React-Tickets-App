import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from "@tickets_dl/common";
import mongoose from "mongoose";
import { Ticket } from "../../../models/tickets";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
    // create an instance of the OderCancelledListener
    const listener = new OrderCancelledListener(natsWrapper.client);
    
    const orderId =new mongoose.Types.ObjectId().toHexString();
    // create and save a ticket
    const ticket = Ticket.build({
        title: 'test ticket',
        price: 100,
        userId: new mongoose.Types.ObjectId().toHexString()
    });
    ticket.set({orderId});
    await ticket.save();

    // create the mock data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        }
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, ticket, data, msg,orderId}
};

it('cancels a ticket reserving and the orderId should be undefined', async() =>{
    

    // create ticket
    const { ticket, data, msg, listener} = await setup();
    // emit order cancel event
    await listener.onMessage({
        id: ticket.orderId,
        version: ticket.version,
        ticket:{
            id: ticket.id
        }
    },msg);

    // orderId should be undefined
    const udpatedTicket = await Ticket.findById(ticket.id)
    expect(udpatedTicket).not.toBeUndefined();
    expect(udpatedTicket.orderId).toBeUndefined();

});

it('updates the ticket, publises an event, and acks the message', async()=>{
    const { data, msg, orderId,ticket, listener} = await setup();
    await listener.onMessage(data,msg);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(ticketUpdatedData.id).toEqual(ticket.id);

});