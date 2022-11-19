import express from 'express';
import 'express-async-errors'
import {json} from 'body-parser';
import { errorHandler, NotFoundError, currentUser } from '@tickets_dl/common';
import cookieSession from "cookie-session"
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes';
import { updateTicketsRouter } from './routes/update';



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
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketsRouter);

app.all('*',async (req,res,next)=>{
   throw new NotFoundError()
})

app.use(errorHandler)

export { app };