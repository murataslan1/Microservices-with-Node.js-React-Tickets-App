import mongoose from "mongoose";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";
import { Order, OrderStatus } from "./order";

/*
  We shouldn't resue the ticket model inside tickets srervice 
  because we don't need all the attributes in the ticket model from ticket service
*/

interface TicketAttrs {
    id: string;
    price: number;
    title: string;
}

export interface TicketDoc extends mongoose.Document{
    price: number;
    title: string;
    version:number;
    isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc>{
    build(attrs: TicketAttrs): TicketDoc
    findByEvent(event:{id:string, version:number}):Promise<TicketDoc|null>;
}

const ticketSchema = new mongoose.Schema({
    price:{
        type:Number,
        required: true,
        min: 0
    },
    title:{
        type:String,
        required: true
    }
},{
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    }
})

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findByEvent = (event:{id:string, version:number}) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version -1
    });
};
// statics: function on the schema(class)
ticketSchema.statics.build = (attrs:TicketAttrs) => {
    // to make sure ticket id is consistent accross services
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    });
}

// methods: function on the instance
ticketSchema.methods.isReserved = async function() {
    // this === the ticket document taht just called 'isReserved' method
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.AwaitingPayment, 
                OrderStatus.Complete,
                OrderStatus.Created
            ]
        }
    })
    return !!existingOrder;
}


const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)


export { Ticket };