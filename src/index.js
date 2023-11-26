const express = require('express');
const amqplib = require('amqplib');
const { EmailService } = require('./services');
async function connectQueue() {
    try {
        const connection = await amqplib.connect("amqp://localhost");
        const channel = await connection.createChannel();
        await channel.assertQueue("noti-queue");
        channel.consume("noti-queue", async (data) => {
            console.log(`${Buffer.from(data.content)}`);
            const object = JSON.parse(`${Buffer.from(data.content)}`);
            // const object = JSON.parse(Buffer.from(data).toString());
            await EmailService.sendEmail("shubhamannpurne@gmail.com", object.recepientEmail, object.subject, object.text);
            channel.ack(data);
        })
    } catch(error) {

    }
}

//for checking the connect rabbitmq connection
/*const connectQueue = async () => {
    try {
        const connection = await amqplib.connect('amqp://localhost');
        const channel = await connection.createChannel();

        // Example message to send to the queue
        const messageToSend = {
            recipientEmail: 'example@example.com',
            subject: 'Hello from the queue!',
            text: 'This is a message from the queue.'
        };

        // Send a message to the queue every 5 seconds
        setInterval(() => sendMessageToQueue(channel, messageToSend), 1000);

        // Consume messages from the queue
        channel.consume('noti-queue', async (data) => {
            try {
                const messageContent = Buffer.from(data.content).toString();
                console.log(`Received message from queue: ${messageContent}`);
                // Process the message as needed
                channel.ack(data);
            } catch (error) {
                console.error('Error processing message:', error);
                channel.nack(data);
            }
        });
    } catch (error) {
        console.error('Error connecting to the queue:', error);
    }
};


const sendMessageToQueue = async (channel, message) => {
    try {
        await channel.assertQueue('noti-queue');
        await channel.sendToQueue('noti-queue', Buffer.from(JSON.stringify(message)));
        console.log(`Message sent to queue: ${JSON.stringify(message)}`);
    } catch (error) {
        console.error('Error sending message to queue:', error);
    }
};
*/








const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');
const mailsender = require('./config/email-config');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, async () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    await connectQueue();
    console.log('Queue is up');
});
