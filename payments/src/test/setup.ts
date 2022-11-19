import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest"
import {app} from "../app";
import jwt from 'jsonwebtoken';

jest.mock('../nats-wrapper'); // all test file will use mock nats

// add variable in system
process.env.STRIPE_KEY = process.env.UDEMY_MICRO_SERVICES_STRIPE_SECRET;

// so beforeAll and afterAll can share the mongo variable
let mongo: any;

// tell TS that there will be a function inside global scope
declare global {
    namespace NodeJS{
        interface Global{
            signin(id?: string): string[];
        }
    }
}

beforeAll( async () => {
    process.env.JWT_KEY = 'randomValue';
    const mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri,{})
});

beforeEach( async()=>{
    // cleanup when closd
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections){
        await collection.deleteMany({});
    }

});

afterAll(async ()=>{
    if(mongo){
        await mongo.stop();
    }
    await mongoose.connection.close();

});

global.signin =  (id?: string) => {
    // bc we don't have signin route in ticket service
    // we need to manually build a JWT payload
    // {id, email}
    const payload ={
        id: id || new mongoose.Types.ObjectId().toHexString(),
        // so we can have mimic mutiple users
        email:"test@.test.com"
    }
    //Create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!)
    // Build session Object: {jwt: my_jwt}
    const session = {jwt: token}
    // Trun the sesion object into JSON
    const sessionJSON = JSON.stringify(session);
    // Take JSON and encode it as base64
    const base64session = Buffer.from(sessionJSON).toString('base64');

    // return a string thats the cookie with encoded data
    return [`session=${base64session}`];
};

