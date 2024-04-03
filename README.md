# Blogging System Microservice Architecture

This project implements a simple microservice architecture for building a blogging system. It consists of four services: Posting Service, Commenting Service, Moderation Service (Command Validation), and Data Storage Query Service.

## Features
- **Posting Service**: Allows users to create and publish new blog posts.
- **Commenting Service**: Enables users to add comments to blog posts.
- **Moderation Service**: Validates comments to ensure compliance with guidelines before publishing.
- **Data Storage Query Service**: Stores and retrieves blog posts and comments data.

## Technologies Used
- TypeScript
- Node.js
- Express.js
- RabbitMQ
- React
- Tailwind CSS

## Installation
1. Clone the repository.
2. Navigate to each service directory (posting-service, commenting-service, moderation-service, data-storage-query-service) and install dependencies using npm or yarn.
3. Configure environment variables as necessary.
4. Start each service using npm run dev.
5. Run RabbitMQ Docker container with the following command:
   ```bash
   docker run -d --name rabbitmq -p 5672:5672 rabbitmq


## Usage
1. Create a new blog post using the Posting Service.
2. View the blog post on the React frontend.
3. Add comments to the blog post using the Commenting Service.
4. Comments will go through moderation by the Moderation Service.
5. Once approved, comments will be displayed on the React frontend.


