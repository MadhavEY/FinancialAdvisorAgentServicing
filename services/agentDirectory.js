const moment = require("moment/moment");
const { getCountForAgentDirectory, getAgentDirectory, getMetaDataDesc } = require("../db/agent");

const getFilteredData = async (filterOptions, pageNumber, pageCount) => {
    try {
        // check for agent code array left code ////
        // if(filterOptions.agentCodes && filterOptions.agentCodes.length > 0){

        // } 
        // else {
        const offset = (pageNumber - 1) * pageCount;
        const query = await createQuery(filterOptions);
        const countQuery = await getCountQuery(filterOptions);
        const countRes = await getCountForAgentDirectory(countQuery, filterOptions);
        const totalCount = parseInt(countRes, 10);
        const totalPages = Math.ceil(totalCount / pageCount);
        const res = await getAgentDirectory(query, filterOptions, pageCount, offset);
        return {
            totalCount,
            totalPages,
            data: res
        };
        // }
    } catch (error) {
        console.error("Error: ", error);
        throw error;
    }
}

const createQuery = async (filterOptions) => {
    try {
        let query = `
        SELECT ad.* 
        FROM agentservicing.agent_directory ad
        WHERE (`;

        switch (filterOptions.leaderType) {
            case 'all':
                query += `
                    ad.dt_leader_code = $1 
                    OR ad.l1_leader_code = $1
                    OR ad.l2_leader_code = $1
                `;
                break;
            case 'dt':
                query += `
                    ad.dt_leader_code = $1 
                `;
                break;
            case 'l1':
                query += `
                    ad.l1_leader_code = $1
                `;
                break;
            case 'l2':
                query += `
                    ad.l2_leader_code = $1
                `;
                break;
            default:
                query += `
                    ad.dt_leader_code = $1 
                    OR ad.l1_leader_code = $1
                    OR ad.l2_leader_code = $1
                `;
                break;
        }        

        query += `) AND ad.nstatus = $2
        
        AND (
            LOWER(ad.advisor_name) LIKE LOWER(CONCAT('%', COALESCE($3, ''), '%'))
            OR LOWER(ad.advisor_code) LIKE LOWER(CONCAT('%', COALESCE($3, ''), '%'))
        )
        
        AND ad.id NOT IN 
        (
            SELECT ad2.id
            FROM agentservicing.agent_directory ad1
            INNER JOIN agentservicing.agent_directory ad2
            ON ad2.advisor_code = ad1.advisor_code
            WHERE ad2.id > ad1.id
        )
        ORDER BY ad.id DESC
        LIMIT $4 OFFSET $5
        `
        // ORDER BY ad.advisor_code
        
        return query;
    } catch (error) {
        return error
    }
}

const getCountQuery = async (filterOptions) => {
    try {
        let query = `
        SELECT COUNT(DISTINCT ad.id) AS totalCount
        FROM agentservicing.agent_directory ad
        WHERE (`;

        switch (filterOptions.leaderType) {
            case 'all':
                query += `
                    ad.dt_leader_code = $1 
                    OR ad.l1_leader_code = $1
                    OR ad.l2_leader_code = $1
                `;
                break;
            case 'dt':
                query += `
                    ad.dt_leader_code = $1 
                `;
                break;
            case 'l1':
                query += `
                    ad.l1_leader_code = $1
                `;
                break;
            case 'l2':
                query += `
                    ad.l2_leader_code = $1
                `;
                break;
            default:
                query += `
                    ad.dt_leader_code = $1 
                    OR ad.l1_leader_code = $1
                    OR ad.l2_leader_code = $1
                `;
                break;
        }        

        query += `) AND ad.nstatus = $2
        
        AND (
            LOWER(ad.advisor_name) LIKE LOWER(CONCAT('%', COALESCE($3, ''), '%'))
            OR LOWER(ad.advisor_code) LIKE LOWER(CONCAT('%', COALESCE($3, ''), '%'))
        )
        
        AND ad.id NOT IN 
        (
            SELECT ad2.id
            FROM agentservicing.agent_directory ad1
            INNER JOIN agentservicing.agent_directory ad2
            ON ad2.advisor_code = ad1.advisor_code
            WHERE ad2.id > ad1.id
        )`;
        return query;
    } catch (error) {
        return error
    }
}

const updateSrDetailsData = async (data) => {
    try {
        let updateData = data[0];
        let timeEvents = [];
        timeEvents.push({
            event: 'Service Request Raised',
            time: moment(updateData.created_date, "YYYY-MM-DD HH:mm:ss.SSS").format("HH:mm A"),
            date: moment(updateData.created_date, "YYYY-MM-DD HH:mm:ss.SSS").format("DD/MM/YYYY")
        });
        timeEvents.push({
            event: updateData.sr_status,
            time: moment(updateData.closed_date, "YYYY-MM-DD HH:mm:ss.SSS").format("HH:mm A"),
            date: moment(updateData.closed_date, "YYYY-MM-DD HH:mm:ss.SSS").format("DD/MM/YYYY")
        });

        updateData.timeEvents = timeEvents;

        updateData.created_date = moment(updateData.created_date).format("D MMM YYYY");
        updateData.closed_date = moment(updateData.closed_date).format("D MMM YYYY");
        if(updateData.values.oldValues.title){
            updateData.values.oldValues.title = await getMetaDataDesc(updateData.values.oldValues.title);
        }
        if(updateData.values.newValues.title){
            updateData.values.newValues.title = await getMetaDataDesc(updateData.values.newValues.title);
        }
        if(updateData.values.oldValues.relationship){
            updateData.values.oldValues.relationship = await getMetaDataDesc(updateData.values.oldValues.relationship);
        }
        if(updateData.values.newValues.relationship){
            updateData.values.newValues.relationship = await getMetaDataDesc(updateData.values.newValues.relationship);
        }
        return updateData;
    } catch (error) {
        return error
    }
}





module.exports = {
    getFilteredData,
    updateSrDetailsData
}