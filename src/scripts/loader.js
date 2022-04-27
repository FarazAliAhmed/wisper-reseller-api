const fs = require('fs')
const path = require('path')
const { getAll } = require('../services/plan.service')

const fileName = 'plans.json'
const filePath = './src/scripts/'

const loadPlans = async () => {
    const allPlans = await getAll()
    const plansObject = JSON.stringify(allPlans.plan)
    
    const fullPath = path.resolve(__dirname, filePath, fileName)
    fs.writeFile(fullPath, plansObject, (error) => {
        if(error){
            console.log("Error while writing all plans to file")
            return
        }
    })
}


module.exports = {
    loadPlans
}