import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it('has fetching individual orders with invalid id',async()=>{
    const inValidId = "invalidId"
    const getOrderResponse = await request(app)
      .get(`/api/orders/${inValidId}`)
      .set('Cookie',global.signin())
      .send();
    expect(getOrderResponse.status).not.toEqual(404); 
});

it('has fetching individual orders',async()=>{
    const mongooseId = mongoose.Types.ObjectId;
    const getOrderResponse = await request(app)
      .get(`/api/orders/${mongooseId}`)
      .set('Cookie',global.signin())
      .send();
    expect(getOrderResponse.status).toEqual(404); 
});

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
    const getOrderResponse = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Cookie',user)
      .send();
    const {body: order} = getOrderResponse;
    expect(getOrderResponse).not.toEqual(404);
    expect(order.id).toEqual(orderId);
    expect(order.ticket.id).toEqual(ticket.id);

});

it('fail if the user is different',async()=>{
    const user = global.signin();
    const userTwo = global.signin();
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
    // fetch order with different user auth
    await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Cookie',userTwo)
      .send()
      .expect(401);

});