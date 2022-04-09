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


const deleteAccount = async (account_id) => {
    
}


module.exports = {
    getAll,
    getOne,
    getAdmins,
}