const { authentication, validation } = require("../middleware");
const { agent } = require("../controllers");


async function quoteRoutes(fastify, options) {
    fastify.post(
        "/get-sr-list",
        { preHandler: [authentication, validation] },
        agent.getServiceList
    );
    fastify.post(
        "/get-directory",
        { preHandler: [authentication, validation] },
        agent.getDirectory
    );
  }
  
  module.exports = quoteRoutes;