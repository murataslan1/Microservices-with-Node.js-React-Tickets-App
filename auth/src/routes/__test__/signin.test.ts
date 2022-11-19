import request from "supertest";
import {app} from "../../app";

it('returns a 400 with an invalid email', async()=>{
    return request(app)
    .post('/api/users/signin')
    .send({
        email: '@@test.com',
        password: 'test'
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async()=>{
    return request(app)
    .post('/api/users/signin')
    .send({
        email: 'test@test.com',
        password: ''
    })
    .expect(400);
});

it('fails when a email that does nto exist is supplied', async()=>{
    await request(app)
      .post('/api/users/signin')
      .send({
        email:'test@test.com',
        password:'test'
      })
      .expect(400);
})

it('fails when an incorrect password is supplied', async() => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email:'test@test.com',
        password:'test'
      })
      .expect(201);

      await request(app)
      .post('/api/users/signin')
      .send({
        email:'test@test.com',
        password:'safassaf'
      })
      .expect(400);
})

it('responds with a cookie when given valid crentials', async() => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email:'test@test.com',
        password:'test'
      })
      .expect(201);

      const response = await request(app)
      .post('/api/users/signin')
      .send({
        email:'test@test.com',
        password:'test'
      })
      .expect(200);

      expect(response.get('Set-Cookie')).toBeDefined();
})