import express,{Request,Response} from 'express';
import cors from 'cors';
import crypto,{randomBytes} from 'crypto';
import axios from 'axios';
import { rabbitMQConnect } from './rabbitmq/rabbitmqConnection';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

type user = {
    [key:string]:Array<{ 
        id: string; 
        content: string; 
        status:string;
    }>;
}

enum Status{
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected'
}

const commentsByPostId:user = {};

app.get('/posts/:id/comments',(req:Request,res:Response) => {
    res.send(commentsByPostId[req.params.id] || []);
})

app.post('/posts/:id/comments',async(req:Request,res:Response) => {
    const { content } = req.body;
    const id = randomBytes(5).toString('hex');

    let comments = commentsByPostId[req.params.id] || [];
    comments.push({
        id:id,
        content:content,
        status:Status.PENDING
    });
    
    commentsByPostId[req.params.id] = comments;

    const exchange = 'commentExchange';
    const queue1 = 'commandStoring';
    const queue2 = 'commandModeration';
    

    const { connection, channel} = await rabbitMQConnect();

    await channel.assertExchange(exchange,'fanout',{durable:true});
    
    await channel.assertQueue(queue1,{durable:true});
    await channel.assertQueue(queue2,{durable:true});

    await channel.bindQueue(queue1,exchange,"");
    await channel.bindQueue(queue2,exchange,"");

    const data = {
        id,
        content,
        postID:req.params.id,
        status:Status.PENDING
    };

    await channel.publish(exchange,"",Buffer.from(JSON.stringify(data)));


    res.status(201).send(comments);

})

async function commandModerated() {
    const { connection, channel } = await rabbitMQConnect();
    const newQueue1 = 'modifiedqueue1'

    channel.consume(newQueue1,(msg) => {
        if(msg != null){
            const msgContent = msg?.content.toString();
            const data = JSON.parse(msgContent);
            const { id, content, postId, status } = data;
            let commands =  commentsByPostId[data.postId] ;
            let command = commands.find(c => c.id == data.id)
            if(command) 
                command.status = data.status;
            channel.ack(msg)

        }
        
    })

}

commandModerated();


app.listen(4001,() => {
    console.log(`server is running at http://localhost:4001`);
})