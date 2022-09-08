const {Account} = require('../models/account')

const getAll = async () => {
    try{
        const response = await Account.find({isAdmin: false}).exec()
        return {business: response, message: "Fetch successful"}
    }catch(e){
        return {error: true, message: "Error fetching all business accounts"}
    }
}

const getOne = async (account_id) => {
    try{
        const response = await Account.findById(account_id).exec()
        return {business: response, message: "Account Fetch Successful"}
    }catch(e){
        return {error: true, message: "Error fetching this businessAccount"}
    }
}


const getAdmins = async () => {
    try{
        const response = await Account.find({isAdmin: true}).exec()
        return {admin: response, message: "Admin fetch successful"}
    }catch(e){
        return {error: true, message: "Error fetching system Admins"}
    }

}


const disableAccount = async (account_id) => {
    try{
        const resp = await Account.findOneAndUpdate({account_id}, {active: false}, {new: true}).exec()
        return {account: resp, message: "Account has been disabled"}
    }catch(err){
        return {error: true, message: "Unable to disable user account"}
    }
}

const enableAccount = async (account_id) => {
    try{
        const resp = await Account.findOneAndUpdate({account_id}, {active: true}, {new: true}).exec()
        return {account: resp, message: "Account has been enabled"}
    }catch(err){
        return {error: true, message: "Unable to enable user account"}
    }
}


const updateAccountType = async (account_id, type) => {
    try{
        const resp = await Account.findOneAndUpdate({account_id}, {type}, {new: true}).exec()
        return {account: resp, message: `User account type has been update to ${type}`}
    }catch(err){
        return {error: true, message: "Unable to update user account type"}
    }
}


module.exports = {
    getAll,
    getOne,
    getAdmins,
    enableAccount,
    disableAccount,
    updateAccountType,
}