import express from 'express';
import 'express-async-errors'
import {json} from 'body-parser';
import { errorHandler, NotFoundError, currentUser } from '@tickets_dl/common';
import cookieSession from "cookie-session"
import { indexOrderRouter } from './routes';
import { deleteOrderRouter } from './routes/delete';
import { showOrderRouter } from './routes/show';
import { newOrderRouter } from './routes/new';

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
app.use(indexOrderRouter);
app.use(deleteOrderRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);

app.all('*',async (req,res,next)=>{
   throw new NotFoundError()
})

app.use(errorHandler)

export { app };