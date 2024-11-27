const { getCountForAgentDirectory, getAgentDirectory } = require("../db/agent");

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





module.exports = {
    getFilteredData
}