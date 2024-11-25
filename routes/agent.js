const { authentication, validation } = require("../middleware");
const { agent } = require("../controllers");


async function quoteRoutes(fastify, options) {
    fastify.post(
        "/get-sr-list",
        { preHandler: [authentication, validation] },
        agent.getServiceList
    );
    fastify.get(
        "/get-hierarchy",
        { preHandler: [authentication, validation] },
        agent.getHierarchy
    );
  }
  
  module.exports = quoteRoutes;