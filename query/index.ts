import express from 'express';
import cors from 'cors';
import axios from 'axios'
import { rabbitMQConnect } from './rabbitmq/connection';


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

interface Comments{
    id:string,
    content:string,
    status:string
}


interface Post{
    id:string,
    title:string,
    comments:Comments[]
}

interface Posts{
    [PostId:string]:Post
}


enum Status{
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected'
}


const posts:Posts = {}




app.get('/posts',(req,res)=>{
    res.send(posts)
})



// Consuming Post Message from 
async function setupPost() {
    try {
    const queue = 'postData';


    // Exchange & Queue creation.Then Binding this Queue & Exchange
    const { connection, channel } =await rabbitMQConnect();
        // Consuming Message
        channel.consume(queue, (msg) => {
            if(msg !== null){
                console.log("Received message:", msg.content.toString());
                const msgContent = msg.content.toString();
                const { id, title } = JSON.parse(msgContent);
                posts[id] = {id, title, comments:[]};
                channel.ack(msg)
            }
        })
    } catch (error) {
        console.log("Rabbitmq Error : ",error)
    }
}
setupPost();


async function commandMessage() {
    const queue1 = 'commandStoring';

    const { connection, channel} = await rabbitMQConnect();

    channel.consume(queue1,(msg) => {
        if(msg != null){
            console.log('message Recevied',msg.content.toString());
            const msgContent = msg.content.toString();
            const data = JSON.parse(msgContent);
            const { id, content, postID, status } = data;

            const post = posts[postID];
            post.comments.push({
                id,
                content,
                status:Status.PENDING
            });

            channel.ack(msg)


        }
    })

}
commandMessage();


async function commandModerated() {
    const { connection, channel } = await rabbitMQConnect();
    const newQueue1 = 'modifiedqueue2'

    channel.consume(newQueue1,(msg) => {
        if(msg != null){
            const msgContent = msg?.content.toString();
            const data = JSON.parse(msgContent);
            const {id, postId, content, status} = data;

            let post =  posts[postId] ;
            if(post){
                let comment = post.comments.find(c => c.id == id);
    
                if(comment) 
                    comment.status = status;
            }
            channel.ack(msg)
        }
    })

}

commandModerated();

app.listen(4002,async()=>{
    console.log(`Server is running @  http://localhost:4002`);
})
