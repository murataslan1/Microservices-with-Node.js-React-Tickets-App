import mongoose from 'mongoose';
import request from 'supertest';
import {app} from "../../app";
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import {natsWrapper } from "../../nats-wrapper";
// jest.mock('../../nats-wrapper'); // redirect the import to the __mocks__

it('has a route handler listenting to /api/tickets for post reqeust',async () => {
  const response = await request(app)
      .post('/api/orders')
      .send({});

      expect(response.status).not.toEqual(404);
})

it('can only be accessed if the user is signed in',async () => {
  const response = await request(app)
      .post('/api/orders') 
      .send({})
      .expect(401);
})

it('returns a status other than 401 if user is signed in ',async () => {
  const cookie = global.signin();
  const response = await request(app)
      .post('/api/orders')
      .set('Cookie',cookie)
      .send({});

      expect(response.status).not.toEqual(401);
})

//////////////////// bussiness logic test ////////////////////

it('return a not found error if ticket id does not passed',async () => {
  // NotFoundError is expected
  await request(app)
    .post('/api/orders')
    .set("Cookie", global.signin())
    .send({})
    .expect(404);

  const nonExistedticketId = mongoose.Types.ObjectId
  await request(app)
    .post('/api/orders')
    .set("Cookie", global.signin())
    .send({
     invalidTicketId: nonExistedticketId
    })
    .expect(404);
})


it('returns an error if the ticket is already reserved',async ()=>{
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price:100
  })
  await ticket.save();
  // the ticket is reserved by this order
  const order = Order.build({
    ticket,
    userId: 'randomId',
    status: OrderStatus.Created,
    expiresAt: new Date(), // exprires right away
  })
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie',global.signin())
    .send({ticketId: ticket.id})
    .expect(400);
});

it('reserves a ticket', async () =>{
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 100
  })
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie',global.signin())
    .send({ticketId: ticket.id})
    .expect(201);

});

it(' emits an order created event after reserves a ticket',async() =>{
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 100
  })
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie',global.signin())
    .send({ticketId: ticket.id})
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
})