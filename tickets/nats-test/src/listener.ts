import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/ticket-created-listener";

// console.clear();

//  client                  clusterID, clientID
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'),{
    url:'http://localhost:4222'
});

stan.on('connect',()=>{
    console.log("Listener connected to NATS!");

    stan.on('close', ()=>{
        console.log("NATS listener connection closed!")
        process.exit();
    });
    new TicketCreatedListener(stan).listen();

    // const options = stan.subscriptionOptions()
    //   .setManualAckMode(true)  // anknowledge mode (queue only confrim the event is correctly processed after receive ack)
    //   .setDeliverAllAvailable() // send all event history (in case listener is down)
    //   // not practical to resend months years logs 
    //   .setDurableName('orders-service'); // only send event with dubrable subscriptions 
    //   // (setDeliverAllAvailable will ony be used for the first time)
    // // queue distributes event to only one of listener to prevent duplicated handling 
    // const subscription = stan.subscribe('ticket:created',
    //     'queue-group-name', // make sure even temp disconnect durableName log will not be dumped
    //     options); 

    // subscription.on('message', (msg:Message)=>{ 
    //     const data = msg.getData();
    //     if( typeof data === 'string'){
    //         console.log(`Received event #${msg.getSequence()}, with data: ${data}`)
    //     }
    //     msg.ack();
    // });
});


// close before intercepted or terminated
process.on('SIGNINT', () => stan.close()); // intercept 
process.on('SIGTERM',() => stan.close());  // terminate 


