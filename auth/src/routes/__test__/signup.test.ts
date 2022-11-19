import request from "supertest";
import {app} from "../../app";

it('returns a 201 on successful signup', async() => {
    // send with valided email, password in payload
    return request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'test'
    })
    .expect(201);
});

it('returns a 400 with an invalid email', async()=>{
    return request(app)
    .post('/api/users/signup')
    .send({
        email: '@@test.com',
        password: 'test'
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async()=>{
    return request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: ''
    })
    .expect(400);
});


it('returns a 400 with missing email and password', async()=>{
    await request(app)
    .post('/api/users/signup')
    .send({email:'test@test.com' })
    .expect(400);

    await request(app)
    .post('/api/users/signup')
    .send({password: 'test' })
    .expect(400);

    await request(app)
    .post('/api/users/signup')
    .send({})
    .expect(400);
});

it('disallows duplicates emails', async()=>{
    await  request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'test'
    })
    .expect(201);

    await  request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'test'
    })
    .expect(400);
});


it('sets a cookie after successful signup', async()=>{
    const response = await request(app)
    .post('/api/users/signup')
    .send({
        email:'test@test.com',
        password:'test' }) 
    .expect(201);

    // might fail due to cookieSession secure: true (only avaiable in https request)
    expect(response.get('Set-Cookie')).toBeDefined(); 
})