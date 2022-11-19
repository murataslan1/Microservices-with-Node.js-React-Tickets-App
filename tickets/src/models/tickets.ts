import mongoose from "mongoose";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";

// data to create a ticket
export interface TicketsAttrs  {
    title:string,
    price: number,
    userId: string
}

// data to create a ticket + anything will be added on ticket
interface TicketsDoc extends mongoose.Document {
    title:string,
    price: number,
    userId: string,
    version: number, // solution of concurrency
    orderId?: string
}

interface TicketModel extends mongoose.Model<TicketsDoc>{
    build(attrs: TicketsAttrs): TicketsDoc;
}

const ticketSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },price:{
        type:Number,
        required: true
    },userId:{
        type:String,
        required: true
    },
    orderId:{
        type: String,
    }
}, 
{toJSON: {
    transform(doc, ret){
        ret.id = ret._id;
        delete ret._id;
    }}
})

// solution for concurrency issue
ticketSchema.set('versionKey','version');  // use version instead of __v as version record property
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketsAttrs) => {
    return new Ticket(attrs)
}


const Ticket = mongoose.model<TicketsDoc, TicketModel>('Ticket', ticketSchema);

export {Ticket}