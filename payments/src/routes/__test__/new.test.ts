import { OrderStatus } from "@tickets_dl/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Payment } from "../../models/payment";
import {stripe} from "../../stripe"

 // jest.mock('../../stripe.ts'); // if added -> jest will use the mock instance in __mocks__

it('shows not authorize error',async()=>{
    await request(app)
      .post('/api/payments')
      .send()
      .expect(401);
});

it('checks body validation',async()=>{
    const cookie = await global.signin();
    const responseWithTwoErrors = await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send()
      .expect(400)
    expect(responseWithTwoErrors.body.errors).toHaveLength(2);
    // toekn
    const responseWithOrderError = await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send({
        token: 'test'
      })
      .expect(400)
    expect(responseWithOrderError.body.errors).toHaveLength(1);
    expect(responseWithOrderError.body.errors[0].field).toEqual( "orderId");
    // orderID
    const responseWithTokenError = await request(app)
    .post('/api/payments')
    .set('Cookie', cookie)
    .send({
      orderId: 'test'
    })
    .expect(400)
    expect(responseWithTokenError.body.errors).toHaveLength(1);
    expect(responseWithTokenError.body.errors[0].field).toEqual( "token");

    // order not found
    const responseOrderNotFound = await request(app)
    .post('/api/payments')
    .set('Cookie', cookie)
    .send({
        token:'thisIsToken',
        orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404)

});


it('throws error due to cancelled order, throw unauth due to user id not matched',async()=>{
    const userId = new mongoose.Types.ObjectId().toHexString();
    const cookie = await global.signin(userId);
    
    const orderUnAuth = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Cancelled,
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 100
    })
    await orderUnAuth.save();

    await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send({
        token: 'thisIsToken',
        orderId: orderUnAuth.id
      })
      .expect(401);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Cancelled,
        version: 0,
        userId: userId,
        price: 100
    })
    await order.save();
    await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send({
        token: 'thisIsToken',
        orderId: order.id
      })
      .expect(400);

});

it('responds success',async()=>{
    const userId = new mongoose.Types.ObjectId().toHexString();
    const cookie = await global.signin(userId);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Cancelled,
        version: 0,
        userId: userId,
        price: 100
    })
    await order.save();
    await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send({
        token: 'thisIsToken',
        orderId: order.id
      })
      .expect(400);
});

///

it('returns a 404 with purchasing an order that does not exist', async() => {
    const cookie = await global.signin();
    await request(app)
      .post('/api/payments')
      .set('Cookie',cookie)
      .send({
        token:'token',
        orderId: new mongoose.Types.ObjectId().toHexString()
      })
      .expect(404);
});

it('returns a 401 when purchasing an order that doesnt belong to the user',async() => {
    const cookie = await global.signin();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 100
    });
    await order.save();

    await request(app)
      .post('/api/payments')
      .set('Cookie',cookie)
      .send({
        token:'token',
        orderId: order.id
      })
      .expect(401);
});


it('returns a 400 when purchasing a cancelled order',async()=>{
    const userId = new mongoose.Types.ObjectId().toHexString();
    const cookie = await global.signin(userId);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Cancelled,
        userId: userId,
        version: 0,
        price: 100
    });
    await order.save();
    await request(app)
    .post('/api/payments')
    .set('Cookie',cookie)
    .send({
      token:'token',
      orderId: order.id
    })
    .expect(400);


});

it('returns a 201 with valid input', async() => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000) // random generates unique price so we can identify it in  the stripe retrive charges API
  const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      userId: userId,
      version: 0,
      price: price
  });
  await order.save();
  await request(app)
    .post('/api/payments')
    .set('Cookie',global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);

    const stripeCharges = await stripe.charges.list({ limit:30 });
    
    const stripeCharge = stripeCharges.data.find(charge => {
      // use random generated price to identify the order
      return charge.amount === price * 100;
    })
    expect(stripeCharge).toBeDefined;
    expect(stripeCharge!.currency).toEqual('usd');
    const payment = await Payment.findOne({stripeId: stripeCharge.id, orderId: order.id});
    expect(payment).not.toBeNull();

});