const { validation, event } = require("../db");
const { statusCodes, responseFormatter } = require("../utils");

const authentication = async (request, reply) => {
  const accessToken = request.headers["authorization"]?.split(" ")[1];
  if (!accessToken) {
    return reply
      .status(statusCodes.UNAUTHORIZED)
      .send(responseFormatter(statusCodes.UNAUTHORIZED, "No token provided!"));
  }

  try {
    const jwtToken = accessToken.split(".");
    // Decode the JWT token
    console.log("jwtToken", jwtToken);

    const decoded = JSON.parse(
      Buffer.from(jwtToken[1], "base64").toString("utf8")
    );
    console.log("decoded", decoded);

    const checkActiveFlag = await validation.checkActiveFlag(decoded.oid);
    console.log("checkActiveFlag", checkActiveFlag);
    if (checkActiveFlag[0]?.activeflag) {
      await event.insertSessionData(decoded.oid, decoded.uti, decoded.exp);
      request.user = decoded;
    } else {
      return reply
        .status(statusCodes.FORBIDDEN)
        .send(
          responseFormatter(
            statusCodes.FORBIDDEN,
            "Access denied: User is inactive."
          )
        );
    }
  } catch (err) {
    console.error(err); // Log the error for debugging
    return reply
      .status(statusCodes.FORBIDDEN)
      .send(
        responseFormatter(
          statusCodes.FORBIDDEN,
          "Failed to authenticate token."
        )
      );
  }
};

module.exports = authentication;
