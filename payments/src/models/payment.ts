import mongoose from 'mongoose';

interface PaymentAttrs {
    orderId: string,
    stripeId: string,
    version: number, 
    /*
    in this app we never gonna udpate payment so we might not need it
    but for most of the cases or for the sake of the furture implemention,
    it is better to add on version
    */
}

interface PaymentDoc extends mongoose.Document{
    orderId: string,
    stripeId: string,
    version: number
}

interface PaymentModel extends mongoose.Model<PaymentDoc>{
    build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema({
    orderId:{
        required: true,
        type: String
    },
    stripeId:
    {
        required: true,
        type: String
    },
    version:
    {
        reuqired: true,
        type: Number,
    },
},{
    toJSON:{
        transform(doc, ret){
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment(attrs);
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };