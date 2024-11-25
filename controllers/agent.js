const { responseFormatter, statusCodes } = require("../utils");
const { event, agent } = require("../db");
const moment = require("moment/moment");

exports.getServiceList = async (request, reply) => {
  try {
    const { identity } = request.isValid;
    const { pageNumber, pageCount } = request.body;
    const srData = await agent.getServcingList(identity, pageNumber, pageCount); // Getting meta data from DB & maping keys

    if (srData.data.length > 0) {
      srData.data.map(item => {
        item.created_date = moment(item.created_date).format("D MMM YYYY");
        item.sr_closed_time = moment(item.sr_closed_time).format("D MMM YYYY");
      });
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "SR Data retrieved successfully",
            srData
          )
        );
    } else {
      return reply
        .status(statusCodes.NO_CONTENT)
        .send(responseFormatter(statusCodes.NO_CONTENT, "Data not found"));
    }
  } catch (error) {
    return reply
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          statusCodes.INTERNAL_SERVER_ERROR,
          "Internal server error occurred",
          { error: error.message }
        )
      );
  }
};
