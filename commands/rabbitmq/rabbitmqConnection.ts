import amqp, { Channel, Connection } from 'amqplib';

const rabbitmqConnect = async():Promise< { connection:Connection, channel:Channel } >=> {
    try {
        const connection = await amqp.connect('amqp:localhost:5672');
        const channel = await connection.createChannel();
        
        return { connection, channel}
    } catch (error) {
        console.log("Rabbitmq Connection Error : ",error);
        throw error;
    }
}