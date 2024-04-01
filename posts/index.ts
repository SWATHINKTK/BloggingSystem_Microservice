import express from 'express';
import cors from 'cors';
import crypto,{constants, randomBytes} from 'crypto';
import axios from 'axios';
import { rabbitMQConnect } from './rabbitmq/connection';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

type user = {
    [key:string]:{
        id:string,
        title:string
    }
}

const posts:user = {};

app.get('/posts',(req,res) => {
    res.send(posts);
})

app.post('/posts',async(req,res) => {
    const { title } = req.body;

    const id = randomBytes(5).toString('hex');

    posts[id] = {
        id, title
    }

    const exchange = 'Post';
    const queue = 'postData';
    const bindingKey = 'routingkey';

    // Exchange & Queue creation.Then Binding this Queue & Exchange
    const { connection, channel } =await rabbitMQConnect();
    await channel.assertExchange(exchange,'direct',{durable:true});
    await channel.assertQueue(queue,{durable:true});
    await channel.bindQueue(queue,exchange,bindingKey);

    // RoutingKey to send a Message to an Exchange
    const routingkey = 'routingkey';
    await channel.publish(exchange,routingkey,Buffer.from(JSON.stringify({id,title})))

    
    // await axios.post('http://localhost:5000/events',{
    //     type:'PostCreated',
    //     data:{
    //         id,title
    //     }
    // }).catch(err => console.log(err))
    res.status(201).send(posts[id]);

})

app.post('/events',(req,res) => {
    console.log('PostReceived',req.body.type);
    res.send({});
})

app.listen(4000,() => {
    console.log(`server is running at http://localhost:4000`);
})
