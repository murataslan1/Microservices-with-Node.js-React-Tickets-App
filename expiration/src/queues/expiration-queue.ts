import Queue from "bull";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher";
import { natsWrapper } from "../nats-wrapper";

interface Payload{
    orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration',{
    redis:{
        host: process.env.REDIS_HOST // in infro expiration-depl.yaml
    }
});

expirationQueue.process(async (job) => {
    console.log("publish an expiration: complete event for orderId", job.data.orderId);
    const expirationCompletePublisher = new ExpirationCompletePublisher(natsWrapper.client);
    expirationCompletePublisher.publish({orderId:job.data.orderId});
});

export {expirationQueue};