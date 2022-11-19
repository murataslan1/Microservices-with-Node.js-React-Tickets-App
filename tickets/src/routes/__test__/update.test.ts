import request from 'supertest';
import {app} from "../../app";
import mongoose from "mongoose";
import {natsWrapper } from "../../nats-wrapper";
import { Ticket } from '../../models/tickets';

it('returns a 404 if the provided id does not exist',async()=>{
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie',global.signin())
      .send({
        title:'modified title',
        price:100
      })
      .expect(404);

});

it('returns a 401 if the user is not authenticated',async()=>{
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .send({
        title:'modified title',
        price:100
      })
      .expect(401);
});

it('returns a 401 if the user does not own the ticket',async()=>{
    const originalTitle = "titleOriginal"
    const originalPrice = 100;
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie',global.signin())
      .send({title:originalTitle,price:originalPrice})

      await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie',global.signin()) // signed user id is random generated (different user for every invoking)
      .send({
        title:'modified title',
        price:101
      })
      .expect(401);

      const responseGet = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
    // the orignial title, price are unchanged after failing update
    expect(responseGet.body.title).toEqual(originalTitle);
    expect(responseGet.body.price).toEqual(originalPrice);

});

it('returns a 400 if the user prodivded and invalid title or price',async()=>{
    const userCookie = global.signin();
    const originalTitle = "titleOriginal"
    const originalPrice = 100;
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie',userCookie)
      .send({title:originalTitle,price:originalPrice});

      await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',userCookie)
        .send({title:''})
        .expect(400);
        
      await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie',userCookie)
      .send({})
      .expect(400);

      
      await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',userCookie)
        .send({title:'valid title',price:-50})
        .expect(400);
});

it('update the ticket privided valid inputs',async()=>{
    const userCookie = global.signin();
    const originalTitle = "titleOriginal"
    const originalPrice = 100;
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie',userCookie)
      .send({title:originalTitle,price:originalPrice});

    const updatedTitle = 'updatedTitle'
    const updatedPrice = 999

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie',userCookie)
    .send({title:updatedTitle,price:updatedPrice});

    const responseUpdate = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send()
      .expect(200);

    expect(responseUpdate.body.title).toEqual(updatedTitle);
    expect(responseUpdate.body.price).toEqual(updatedPrice);

});

it('publishes en event', async()=>{

  const userCookie = global.signin();
  const originalTitle = "titleOriginal"
  const originalPrice = 100;
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',userCookie)
    .send({title:originalTitle,price:originalPrice});

  const updatedTitle = 'updatedTitle'
  const updatedPrice = 999

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie',userCookie)
  .send({title:updatedTitle,price:updatedPrice});

  expect(natsWrapper.client.publish).toHaveBeenCalled();

})

it('rejects udpate ticket if the ticket is reserved', async() =>{
  const userCookie = global.signin();
  const originalTitle = "titleOriginal"
  const originalPrice = 100;
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',userCookie)
    .send({title:originalTitle,price:originalPrice});

  const ticket = await Ticket.findById(response.body.id);
  ticket.set({orderId: new mongoose.Types.ObjectId().toHexString()});
  await ticket.save();
  const updatedTitle = 'updatedTitle'
  const updatedPrice = 999

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie',userCookie)
  .send({title:updatedTitle,price:updatedPrice})
  .expect(400);
});
