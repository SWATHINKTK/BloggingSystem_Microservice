import express from "express";
import axios from 'axios';
import { rabbitMQConnect } from "./rabbitmq/rabbitmqConnection";

const app = express();

app.use(express.json({}));
app.use(express.urlencoded({extended:true}))

enum Status{
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected'
}



async function commadModerationMessage(){

    const queue2 = 'commandModeration';

    const { connection, channel} = await rabbitMQConnect();

    const newQueue1 = 'modifiedqueue1'
    const newQueue2 = 'modifiedqueue2'
    const newExchange = 'afterModeration';

    await channel.assertExchange(newExchange,'direct',{durable:true});
    await channel.assertQueue(newQueue1,{durable:true});
    await channel.assertQueue(newQueue2,{durable:true});


    await channel.bindQueue(newQueue1,newExchange,"")
    await channel.bindQueue(newQueue2,newExchange,"")

    await channel.consume(queue2,(msg) => {
        if(msg != null){
            console.log('message recevied', msg.content.toString());
            const msgContent = msg.content.toString();
            const data = JSON.parse(msgContent);
            const status = data.content.includes('good night') ? Status.REJECTED : Status.APPROVED;

            channel.ack(msg)

            const passingData = {
                id:data.id,
                postId:data.postID,
                status:status,
                content:data.content
            }

            channel.publish(newExchange,"",Buffer.from(JSON.stringify(passingData)));

        }
    })
}

commadModerationMessage();

app.listen(4003,() =>{
    console.log(`server is running @ http://localhost:4003`);
})