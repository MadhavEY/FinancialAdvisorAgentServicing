const { responseFormatter, statusCodes } = require("../utils");
const { event, agent } = require("../db");
const moment = require("moment/moment");
const { agentDirectory } = require("../services");

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

exports.getDirectory = async (request, reply) => {
  try {
    const { pageNumber, pageCount, filterOptions } = request.body;
    let response = await agentDirectory.getFilteredData(filterOptions, pageNumber, pageCount);
    response.data.map(async (item) => {
      item.userOfficialDetails = await agent.getOfficialDetailsByAgentCode(item.advisor_code);
      item.userProfile = await agent.getUserProfileData(item.userOfficialDetails.identity);
      item.userContacts = await agent.getUserContactData(item.userOfficialDetails.identity);
      item.userType = await agent.getUserType(item.userOfficialDetails.identity);
    })
    if (response.data.length > 0) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Hierarchy data retrieved successfully",
            response
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
