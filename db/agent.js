const { client } = require("../config/db");

const getServcingList = async (identity, pageNumber, pageCount) => {
  try {
    const offset = (pageNumber - 1) * pageCount;
    const query = `
    SELECT 
    st.idsr_transaction as ticket,
    st.created_date ,
    st.sr_closed_time ,
    s.categoryname ,
    ss.sub_category_name ,
    am.meta_data_name as sr_status
    FROM 
    agentservicing.sr_transaction st
    INNER JOIN agentservicing.srcategory s 
    ON st.idsrcategory = s.idsrcategory 
    INNER JOIN agentservicing.sr_subcategory ss 
    ON st.idsr_subcategory = ss.idsr_subcategory 
    INNER JOIN agentservicing.as_metadata am 
    ON st.idmeta_sr_status  = am.idmetadata 
    WHERE identity_sr_createdby = $1
    LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) AS totalCount 
      FROM agentservicing.sr_transaction
      WHERE identity_sr_createdby = $1
    `;

    const countRes = await client.query(countQuery, [identity]);
    const totalCount = parseInt(countRes.rows[0].totalcount, 10);
    const totalPages = Math.ceil(totalCount / pageCount);
    const res = await client.query(query, [identity, pageCount, offset]);
    return {
      totalCount,
      totalPages,
      data: res.rows
    };
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
}

  module.exports = {
    getServcingList
  };
