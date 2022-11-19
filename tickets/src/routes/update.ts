import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import {validateRequest, NotAuthorizedError,NotFoundError,requireAuth, BadRequestError} from "@tickets_dl/common";
import { Ticket } from '../models/tickets';
import { TicketUpdatedPublisher } from '../events/publishers/ticekt-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id',requireAuth,[
    body('title').not().isEmpty().withMessage('Title is required!'),
    body('price').isFloat({gt:0}).withMessage('Price must be provided and must be greater then 0')
],validateRequest,async(req:Request,res:Response)=>{

    const ticket = await Ticket.findById(req.params.id)
    if(!ticket){
        throw new NotFoundError();
    }

    if(ticket.orderId){
        // prevent edit if ticket has been reserved
        throw new BadRequestError('Cannot edit a reserved ticket');
    }

    if(req.currentUser.id !== ticket.userId){
        throw new NotAuthorizedError();
    }

    ticket.set({
        title: req.body.title,
        price: req.body.price
    })
    await ticket.save();
    await new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id as string,
        version: ticket.version,
        title: ticket.title,
        userId: ticket.userId,
        price: ticket.price});

    res.send(ticket)

})

export {router as updateTicketsRouter}