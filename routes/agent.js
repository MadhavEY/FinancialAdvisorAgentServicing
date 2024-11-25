const { authentication, validation } = require("../middleware");
const { agent } = require("../controllers");


async function quoteRoutes(fastify, options) {
    fastify.get(
        "/get-sr-list",
        { preHandler: [authentication, validation] },
        agent.getServiceList
    );
  }
  
  module.exports = quoteRoutes;