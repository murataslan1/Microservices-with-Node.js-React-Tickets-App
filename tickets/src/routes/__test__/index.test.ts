import request from 'supertest';
import {app} from "../../app";


type TicketInit = { title:string, price:number}

const createTicket = (payload:TicketInit) => {
    return request(app)
    .post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
      title:payload.title,
      price:payload.price,
    });
}

it('can fetch a list of tickets',async () =>{
    await createTicket({title:'ticket01',price:100});
    await createTicket({title:'ticket02',price:200});
    await createTicket({title:'ticket03',price:300});
    const response = await request(app)
      .get('/api/tickets')
      .send()
      expect(200);

    expect(response.body.length).toEqual(3);

});

