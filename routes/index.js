const agent = require("./agent");
async function routes(fastify, options) {
  // Register user and lead routes with prefixes
  fastify.register(agent, { prefix: "/agent" });
}

module.exports = routes;
