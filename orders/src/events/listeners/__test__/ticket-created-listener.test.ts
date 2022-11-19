import {Message} from "node-nats-streaming";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedEvent } from "@tickets_dl/common";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";

const createdTicketListenerSetup = async () => {

    // create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);
    // crate a fake data event
    const data:TicketCreatedEvent['data'] ={
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'test title',
        price:100,
        userId:new mongoose.Types.ObjectId().toHexString()

    }
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, data, msg}
};

it('creates and saves a ticket', async () => {
    // mock ticket -> trigger ticket created event -> check whether the ticket is created or not
    const { listener, data, msg } = await createdTicketListenerSetup();
    // call the onMessage function with the data object + message object
    await listener.onMessage(data,msg);
    // write assertions to make sure a ticket was created
    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket.title).toEqual(data.title);
    expect(ticket.price).toEqual(data.price);

});

it('acks the message', async () => {

    // mock ticket -> trigger ticket created event -> check whether the ticket is created or not
    const { listener, data, msg } = await createdTicketListenerSetup();
    // call the onMessage function with the data object + message object
    await listener.onMessage(data,msg);

    // write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();

});