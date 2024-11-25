const { client } = require("../config/db");

async function checkActiveFlag(oid) {
  try {
    const query = `
          SELECT 
              e.activeflag
          FROM 
              core.entity e 
          JOIN 
              core.user_auth_data u ON u.identity = e.identity
          WHERE 
              u.oid = $1;
        `;
    const res = await client.query(query, [oid]);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error; // Rethrow the error for handling in the controller
  }
}

async function checkValidRoute(oid, eventDefination) {
  try {
    const query = `
          select uad."identity",eua.idurc,vedcc.idevent_defination,vedcc.is_matching 
          from core.user_auth_data uad 
          inner join core.entity_urc_auth eua on eua.identity = uad."identity"
          inner join core.vw_event_def_category_check vedcc on vedcc.idurc = eua.idurc 
          where "oid" = $1 and idevent_defination = $2
          `;
    const res = await client.query(query, [oid, eventDefination]);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

module.exports = {
  checkActiveFlag,
  checkValidRoute,
};
