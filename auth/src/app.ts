import express from 'express';
import 'express-async-errors'
import {json} from 'body-parser';
import { errorHandler, NotFoundError } from '@tickets_dl/common';
import cookieSession from "cookie-session"

import {currentUserRouter} from "./routes/current-user"
import { signinRouter } from './routes/sigin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';




const app = express()
app.set('trust proxy',true) // to pass ingress proxy
app.use(json())
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test' // cookie only be used while connecting with https
    })
)

app.use(currentUserRouter)  // apply route config in current-user
app.use(signinRouter) 
app.use(signoutRouter) 
app.use(signupRouter) 


app.all('*',async (req,res,next)=>{
   throw new NotFoundError()
})

app.use(errorHandler)

export { app };