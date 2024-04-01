import amqp, { Channel, Connection } from 'amqplib';

const rabbitMQConnect = async (): Promise<{ connection: Connection, channel: Channel }> => {
    try {
        const connection = await amqp.connect('amqp://localhost:5672'); 
        const channel = await connection.createChannel();
        
        return { connection, channel };
    } catch (error) {
        console.log('Error connecting to RabbitMQ:', error);
        throw error;
    }
};

export { rabbitMQConnect }
