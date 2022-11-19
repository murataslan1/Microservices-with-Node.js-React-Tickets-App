import request from 'supertest';
import {app} from "../../app";
import mongoose from 'mongoose';

it('returns a 404 if the ticket is not found', async () => {
    
    const validId = new mongoose.Types.ObjectId().toHexString()
    const response = await request(app)
        .get(`/api/tickets/${validId}`)
        .send()
        .expect(404);  
        // response 400 because we don't input a valid id
        // 404: for non-existent but valid id 
        // 400: invalid id

})

it('returns the ticket if the ticket is found', async()=>{
    const _title = 'this is title'
    const _price = 300
    const response = await request(app)
        .post('/api/tickets/')
        .set('Cookie', global.signin())
        .send({
            title:_title,
            price:_price
        })
        .expect(201);
        console.log(response.body);
        const {title, price, id} = response.body
        expect(title).toEqual(_title);
        expect(price).toEqual(_price);
        const queryResponse = await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(200);

        expect(queryResponse.body.title).toEqual(_title);
        expect(queryResponse.body.price).toEqual(_price);


})