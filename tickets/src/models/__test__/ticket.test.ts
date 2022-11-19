import { Ticket } from "../tickets";

it('implements optimistic concurrency control with version records', async() => {
    // create an instance of a ticket
    const ticket = Ticket.build({
        title: 'test',
        price:100,
        userId:'111'
    })

    // save the ticket to the database
    await ticket.save(); // ticket plugin should make a version record

    // fetch the ticket twice 
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // make two separate changes to the tickets we fetched
    firstInstance!.set({price:999});
    secondInstance!.set({price:7777})

    // save the first fetched ticket
    await firstInstance!.save();

    // save the second fetched ticket and expect an error
    try{
        await secondInstance!.save();
    }catch(err){
        return 
    }

    throw new Error('Should now come to here!')
});

it('increment the version number on multiple saves', async() =>{
        // create an instance of a ticket
        const ticket = Ticket.build({
            title: 'test',
            price:100,
            userId:'111'
        })
    
        await ticket.save();
        const firstInstance = await Ticket.findById(ticket.id);
        expect( firstInstance.version).toEqual(0);
        firstInstance!.set({price:999});    
        await firstInstance!.save();
        const firstInstanceSecondTime = await Ticket.findById(ticket.id);
        expect( firstInstanceSecondTime.version).toEqual(1);
        await firstInstanceSecondTime.save();
        expect( firstInstanceSecondTime.version).toEqual(2);

})