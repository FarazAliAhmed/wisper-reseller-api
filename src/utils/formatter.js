const moment = require('moment-timezone')

exports.transformPaginate = (data={}) => {
    const { 
        docs,
        totalDocs,
        offset,
        limit,
        totalPages,
        page,
        prevPage,
        nextPage,
    } = data;
    
    return {
        data: docs,
        pagination: {
            page,
            limit,
            offset,
            count: totalDocs,
            next: nextPage,
            previous: prevPage,
            total: totalPages,
        }
    }
}

exports.getMomentTime = (timeString) => {
    return moment(timeString).tz('Africa/Lagos').format('YYYY/MM/D hh:mm:ss A');
}