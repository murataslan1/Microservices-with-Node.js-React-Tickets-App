import express from 'express';
import 'express-async-errors'
import {json} from 'body-parser';
import { errorHandler, NotFoundError, currentUser } from '@tickets_dl/common';
import cookieSession from "cookie-session"
import { createChargeRouter } from './routes/new';


const app = express()
app.set('trust proxy',true) // to pass ingress proxy
app.use(json())
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test' // cookie only be used while connecting with https
    })
)
app.use(currentUser);
app.use(createChargeRouter);

app.all('*',async (req,res,next)=>{
   throw new NotFoundError()
})

app.use(errorHandler)

export { app };