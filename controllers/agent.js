const { responseFormatter, statusCodes } = require("../utils");
const { event, agent } = require("../db");
const moment = require("moment/moment");
const { agentDirectory } = require("../services");

exports.getServiceList = async (request, reply) => {
  try {
    const { identity } = request.isValid;
    const { pageNumber, pageCount, reqType, reqStatus } = request.body;
    const srData = await agent.getServcingList(identity, pageNumber, pageCount, reqType, reqStatus); // Getting meta data from DB & maping keys

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
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK, 
            "Data not found",
            srData
          )
        );
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
    response.data = await Promise.all(
      response.data.map(async (item) => {
        const userOfficialDetails = await agent.getOfficialDetailsByAgentCode(item.advisor_code);
        const [userProfile, userContacts, userType] = await Promise.all([
          agent.getUserProfileData(userOfficialDetails.identity),
          agent.getUserContactData(userOfficialDetails.identity),
          agent.getUserType(userOfficialDetails.identity),
        ]);

        item.userOfficialDetails = userOfficialDetails;
        item.userProfile = userProfile;
        item.userContacts = userContacts;
        item.userType = userType;

        return item;
      })
    );

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
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Data not found",
            response
          )
        );
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

exports.getServiceDetails = async (request, reply) => {
  try {
    const { identity } = request.isValid;
    const { sr_num } = request.query;
    const srData = await agent.getServiceDetails(identity, sr_num); // Getting meta data from DB & maping keys

    if (srData.length > 0) {
      const updatedData = await agentDirectory.updateSrDetailsData(srData);
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
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK, 
            "Data not found",
            srData
          )
        );
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

exports.getSrFilters = async (request, reply) => {
  try {
    const categoryNames = [
      'Bank', 'Email ID', 'Phone', 'Nominee', 'Address'
    ];

    const statusNames = '026c141202dc4750acb66480a66cd1d6';
    const [subCategories, status] = await Promise.all([
      agent.getSrListSubCategories(categoryNames),
      agent.getSrStatusOptions(statusNames)
    ]); 

    if (subCategories.length > 0 && status.length > 0) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Filter data retrieved successfully",
            {
              types: subCategories,
              status
            }
          )
        );
    } else {
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK, 
            "Data not found",
            srData
          )
        );
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

