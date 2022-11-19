
import mongoose from 'mongoose';
import request from 'supertest';
import {app} from "../../app";
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has fetching individual orders and working post order',async()=>{
    const user = global.signin();
    // created ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'test',
        price:100
      })
      await ticket.save();
    // create order
    const response = await request(app)
      .post('/api/orders')
      .set('Cookie',user)
      .send({ticketId: ticket.id})
      .expect(201);
    
    const {id: orderId} = response.body;
    
    // delete order
    await request(app)
      .delete(`/api/orders/${orderId}`)
      .set('Cookie',user)
      .send({})
      .expect(204);

    // fetch the deleted order and the status is cancel
    const getOrderResponse = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Cookie',user)
      .send();
    const {body: order} = getOrderResponse;
    expect(getOrderResponse).not.toEqual(404);
    expect(order.id).toEqual(orderId);
    expect(order.ticket.id).toEqual(ticket.id);
    expect(order.status).toEqual(OrderStatus.Cancelled)

});

it('emits an order cancelled event',async () =>{
  const user = global.signin();
  // created ticket
  const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'test',
      price:100
    })
    await ticket.save();
  // create order
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie',user)
    .send({ticketId: ticket.id})
    .expect(201);
  
  const {id: orderId} = response.body;
  
  // delete order
  await request(app)
    .delete(`/api/orders/${orderId}`)
    .set('Cookie',user)
    .send({})
    .expect(204);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});