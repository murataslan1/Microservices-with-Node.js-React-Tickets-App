import mongoose from 'mongoose';
import request from 'supertest';
import {app} from "../../app";
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('has a route handler listenting to /api/orders for get reqeust',async () => {
    const response = await request(app)
        .get('/api/orders')
        .send({});
  
        expect(response.status).not.toEqual(404);
  });

  const buildTicket = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'test',
        price:1000
    });
    await ticket.save();
    return ticket;    
  }

  it('fetches orders for an particlular user', async () => {
    // create 3 tickets
    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();

    // create one order as User #1
    const userOne = global.signin();
    const userTwo = global.signin();
    await request(app)
      .post('/api/orders')
      .set('Cookie', userOne)
      .send({ ticketId: ticketOne.id})
      .expect(201);

    // craete two orders as User #2
    const { body: orderOne} = await request(app)
      .post('/api/orders')
      .set('Cookie', userTwo)
      .send({ ticketId: ticketTwo.id})
      .expect(201);

    const { body: orderTwo} = await request(app)
      .post('/api/orders')
      .set('Cookie', userTwo)
      .send({ ticketId: ticketThree.id})
      .expect(201);    

    // make get request to get orders for User #2
    // (make sure the order belongs to User #1)
    const response = await request(app)
      .get('/api/orders')
      .set('Cookie', userTwo)
      .expect(200);
    
    const { body } = response;
    expect(body.length).toEqual(2);
    expect(body[0].id).toEqual(orderOne.id);
    expect(body[1].id).toEqual(orderTwo.id);
    expect(body[0].ticket.id).toEqual(ticketTwo.id);
    expect(body[1].ticket.id).toEqual(ticketThree.id);

    
  });