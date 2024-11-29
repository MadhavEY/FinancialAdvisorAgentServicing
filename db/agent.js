const { client } = require("../config/db");

const getServcingList = async (identity, pageNumber, pageCount) => {
  try {
    const offset = (pageNumber - 1) * pageCount;
    const query = `
    SELECT 
    st.sr_number,
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
    ORDER BY created_date desc 
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

const getCountForAgentDirectory = async (query, data) => {
  try {
    const res = await client.query(query, [data.leaderCode, data.statusType, data.searchText]);
    return res.rows[0].totalcount;
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
}

const getAgentDirectory = async (query, filterOptions, pageCount, offset) => {
  try {
    const data = [
      filterOptions.leaderCode, 
      filterOptions.statusType, 
      filterOptions.searchText, 
      pageCount, 
      offset
    ]
    const res = await client.query(query, data);
    return res.rows;
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
}

const getOfficialDetailsByAgentCode = async (agent_code) => {
  try {
    const query = `
    SELECT * 
    FROM core.profile p 
    WHERE business_code = $1`;
    const res = await client.query(query, [agent_code]);
    return res.rows[0] || {};
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
}


const getUserProfileData = async (identity) => {
  try {
    const query = `
    SELECT * 
    FROM core.entity
    WHERE identity = $1`;
    const res = await client.query(query, [identity]);
    return res.rows[0] || {};
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
}


const getUserContactData = async (identity) => {
  try {
    const query = `
    SELECT 
    cm.meta_data_name ,ec.contact_value
    FROM core.entity_contact ec 
    INNER JOIN core.cr_metadata cm 
    ON ec.idmeta_contact_type = cm.idmetadata 
    WHERE identity = $1`;
    const res = await client.query(query, [identity]);
    return res.rows || [];
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
}

const getUserType = async (identity) => {
  try {
    const query = `
    SELECT u.description as userType
    FROM core.entity_urc_auth eua 
    INNER JOIN core.user_role_category urc 
    on eua.idurc = urc.idurc 
    INNER JOIN core.usertype u 
    ON u.idusertype = urc.idusertype 
    WHERE eua.identity = $1`;
    const res = await client.query(query, [identity]);
    return res.rows[0]?.usertype || '';
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
}

const getServiceDetails = async (identity, sr_num) => {
  try {
    const query = `
    SELECT 
    st.sr_number,
    st.created_date ,
    st.sr_closed_time as closed_date,
    st.sr_meta_value as values,
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
    WHERE identity_sr_createdby = $1 AND st.sr_number = $2
    `;

    const res = await client.query(query, [identity, sr_num]);
    return res.rows;
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
}

const getMetaDataDesc = async (idmeta) => {
  try {
    const query = `
    SELECT 
    meta_data_name 
    FROM core.cr_metadata cm 
    WHERE idmetadata  = $1
    `;

    const res = await client.query(query, [idmeta]);
    return res.rows[0].meta_data_name;
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
}

  module.exports = {
    getServcingList,
    getCountForAgentDirectory,
    getAgentDirectory,
    getOfficialDetailsByAgentCode,
    getUserProfileData,
    getUserContactData,
    getUserType,
    getServiceDetails,
    getMetaDataDesc
  };
