const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");
const formbody = require("@fastify/formbody");
const multipart = require("@fastify/multipart");
const { connectToDatabase } = require("./config/db"); //uncommnet to connect db

const dotenv = require("dotenv"); // For managing environment variables
dotenv.config(); // Load environment variables from .env file
const PORT = parseInt(process.env.PORT) || 8080;
const routes = require("./routes");

fastify.register(cors, {
  origin: "*", // Allow all origins (you can modify this to restrict origins)
});
fastify.register(formbody);
fastify.register(multipart);
fastify.register(routes);

// Start server
fastify.listen({ port: 8083, host: "0.0.0.0" }, async (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  await connectToDatabase();
  fastify.log.info(`Server listening a`);
});
