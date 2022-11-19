import express, {Request,Response} from 'express';
import {requireAuth, validateRequest } from '@tickets_dl/common';
import {body} from "express-validator";
import {Ticket} from "../models/tickets";
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/tickets',requireAuth,[
    body('title').not().isEmpty().withMessage('Title is requried'),
    body('price').isFloat({gt: 0}).withMessage('Price must be greater then zero'),
    validateRequest
], async (req:Request,res:Response)=>{
    const {title, price} = req.body;
    const ticket = Ticket.build({title, price, userId:req.currentUser!.id })
    await ticket.save();
    console.log("# ticket",ticket,ticket.id,ticket._id)

    const ticketCreatedPublisher =  new TicketCreatedPublisher(natsWrapper.client)
    console.log("# subject",ticketCreatedPublisher.subject)
    await ticketCreatedPublisher.publish({
        id: ticket.id as string,
        version: ticket.version,
        title: ticket.title,
        userId: ticket.userId,
        price: ticket.price,
    });

    res.status(201).send(ticket);
});

export {router as createTicketRouter};