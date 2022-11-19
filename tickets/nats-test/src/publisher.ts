import nats,{Stan} from "node-nats-streaming";
import { TicketCreatePublisher } from "./events/ticket-created-publisher";

// console.clear();

//  client                  clusterID, clientID
const stan = nats.connect('ticketing', 'abc',{
    url: 'http://localhost:4222'
});


stan.on('connect', async ()=>{
    console.log('Publisher connected to NATS!')

    const publisher = new TicketCreatePublisher(stan)
    await publisher.publish({
        id:'123',
        title:'concert',
        price:100
    })
    
    // // we can only share stream, raw data
    // const data = JSON.stringify({ 
    //     id:'123',
    //     title:'concert',
    //     price:100
    // });

    // // publish(subjectname, data, cb)
    // stan.publish('ticket:created',data,()=>{
    //     console.log("Event published!")   
    // })

});

