const Transactions = require('../../models/transactionHistory');
const response = require('../../utils/dto/response');
const logger = require('../../utils/logger')
const { transformPaginate, getMomentTime } = require('../../utils/formatter');

exports.fetchTransactions = async (req, res) => {
    const {
        page,
        limit,
        offset,
        sort: sortQuery
    } = req.query;

    let sort;
    if(sortQuery){
        try{
            sort = JSON.parse(sortQuery)
        }catch(error){
            return response.jsonFailed(res, null, "Error is sort query. please check and try again");
        }
    }else{
        sort = {_id: -1}
    }

    let resp = await Transactions.paginate({}, {page, limit, offset, sort});
    const transformedResponse = transformPaginate(resp);
    return response.jsonSuccess(res, transformedResponse.data, "success", 200, transformedResponse.pagination);
}

exports.filterTransactions = async (req, res) => {
    const {
        page,
        limit,
        offset,
        sort: sortQuery
    } = req.query;
    
    let {
        date,
        phone: phone_number,
        volume: data_volume,
        provider: network_provider,
        status,
        reference
    } = req.body;

    let sort;
    if(sortQuery){
        try{
            sort = JSON.parse(sortQuery)
        }catch(error){
            return response.jsonFailed(res, null, "Error is sort query. please check and try again");
        }
    }else{
        sort = {_id: -1}
    }

    if(reference){
        const tfRes = await Transactions.findOne({transaction_ref: reference}).exec();
        if(!tfRes) return response.jsonFailed(res, {}, 'No such transaction found', 404)
        return response.jsonSuccess(res, tfRes)
    }

    let dateFilter = {};
    if(date){
        dateFilter = {
            created_at: {
                $gte: getMomentTime(date[0]), $lte: getMomentTime(date[1])
            }
        }
    }
    
    const filters =  {
        phone_number,
        data_volume,
        network_provider,
        status,
        ...dateFilter
    }
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    const resp = await Transactions.paginate(
        filters,
        {page, limit, offset, sort}
    );

    const formatedResp = transformPaginate(resp)
    return response.jsonSuccess(res, formatedResp.data, 'success')
}


exports.fetchBusinessTransactions = async (req, res) => {
    const business_id = req.user._id
    let {
        page,
        limit,
        offset,
        sort: sortQuery
    } = req.query;

    let sort;
    if(sortQuery){
        try{
            sort = JSON.parse(sortQuery)
        }catch(error){
            return response.jsonFailed(res, null, "Error is sort query. please check and try again");
        }
    }else{
        sort = {_id: -1}
    }

    let resp = await Transactions.paginate({business_id}, {page, limit, offset, sort});
    const transformedResponse = transformPaginate(resp);
    return response.jsonSuccess(res, transformedResponse.data, "success", 200, transformedResponse.pagination);
}

exports.filterBusinessTransactions = async (req, res) => {
    const business_id = req.user._id
    let {
        page,
        limit,
        offset,
        sort: sortQuery
    } = req.query;
    
    let {
        date,
        phone: phone_number,
        volume: data_volume,
        provider: network_provider,
        status,
        reference
    } = req.body;

    let sort;
    if(sortQuery){
        try{
            sort = JSON.parse(sortQuery)
        }catch(error){
            return response.jsonFailed(res, null, "Error is sort query. please check and try again");
        }
    }else{
        sort = {_id: -1}
    }

    if(reference){
        const tfRes = await Transactions.findOne({transaction_ref: reference, business_id}).exec();
        if(!tfRes) return response.jsonFailed(res, {}, 'No such transaction found', 404)
        return response.jsonSuccess(res, tfRes)
    }

    let dateFilter = {};
    if(date){
        dateFilter = {
            created_at: {
                $gte: getMomentTime(date[0]), $lte: getMomentTime(date[1])
            }
        }
    }
    
    const filters =  {
        business_id,
        phone_number,
        data_volume,
        network_provider,
        status,
        ...dateFilter
    }
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    const resp = await Transactions.paginate(
        filters,
        {page, limit, offset, sort}
    );

    const formatedResp = transformPaginate(resp)
    return response.jsonSuccess(res, formatedResp.data, 'success')
}
