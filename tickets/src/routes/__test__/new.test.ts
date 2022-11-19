import request from 'supertest';
import {app} from "../../app";
import {Ticket} from "../../models/tickets";
import {natsWrapper } from "../../nats-wrapper";
// jest.mock('../../nats-wrapper'); // redirect the import to the __mocks__

it('has a route handler listenting to /api/tickets for post reqeust',async () => {
  const response = await request(app)
      .post('/api/tickets')
      .send({});

      expect(response.status).not.toEqual(404);
})

it('can only be accessed if the user is signed in',async () => {
  const response = await request(app)
      .post('/api/tickets') 
      .send({})
      .expect(401);
})

it('returns a status other than 401 if user is signed in ',async () => {
  const cookie = global.signin();
  const response = await request(app)
      .post('/api/tickets')
      .set('Cookie',cookie)
      .send({});

      expect(response.status).not.toEqual(401);
})

it('return an error if an invalid title is provided',async () => {
  // RequestValidationError is expected
  await request(app)
      .post('/api/tickets')
      .set("Cookie", global.signin())
      .send({
        title: '',
        price: 50
      })
      .expect(400);

      await request(app)
      .post('/api/tickets')
      .set("Cookie", global.signin())
      .send({
        price: 50
      })
      .expect(400);
})

it('returns an error if an invalid price is proviced',async () => {
  await request(app)
  .post('/api/tickets')
  .set("Cookie", global.signin())
  .send({
    title: 'valid title',
    price: -50
  })
  .expect(400);

  await request(app)
  .post('/api/tickets')
  .set("Cookie", global.signin())
  .send({
    title: 'valid title',
  })
  .expect(400);
  

})

it('creates a ticket with valid inputs',async () => {
  // after db is implemented, add in a check to make sure ticket was saved
  let tickets = await Ticket.find({}); // fnid all tickets
  expect(tickets.length).toEqual(0); // there is a cleanup logic in before each
  const title = "test";
  const price = 999
  await request(app)
      .post('/api/tickets')
      .set('Cookie',global.signin())
      .send({
        title,
        price
      })
      .expect(201);

      tickets = await Ticket.find({}); 
      expect(tickets.length).toEqual(1);
      expect(tickets[0].title).toEqual(title);
      expect(tickets[0].price).toEqual(price);

})

it('publishes an event', async ()=>{
  
  const title = "test";
  const price = 999
  await request(app)
      .post('/api/tickets')
      .set('Cookie',global.signin())
      .send({
        title,
        price
      })
      .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});