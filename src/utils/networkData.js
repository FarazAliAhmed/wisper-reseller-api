const _ = require('lodash')
const fs = require('fs')

exports.numbers = {
   "mtn": [ "0803", "0806", "0810", "0813", "0814", "0816", "0702", "0703", "0704", "0706", "0903", "0906", "0913", "0916",],
   "glo": ["0805", "0807", "0811", "0815", "0705", "0905", "0915"],
   "airtel": [ "0802", "0808", "0812", "0701", "0708", "0901", "0902", "0904", "0907", "0912", "0911"],
   "9mobile": ["0809", "0817", "0818", "0908", "0909"]
}

exports.units = { //what to multiply by, to convert to MB
    "gb": 1024,
    "mb": 1,
    "tb": 1048576
}

exports.ported_numbers = ["0913", "0912"]

exports.network_ids = {
    1: "mtn",
    2: "glo",
    3: "9mobile",
    4: "airtel"
}

exports.plans = (function() {
   const allPlans = {}
   // const plansJSON = require('./plans.json')
   let plansJSON = JSON.parse(fs.readFileSync(`${__dirname}/plans.json`))
   plansJSON.forEach(planObject => {
      allPlans[planObject.plan_id] = _.pick(planObject, ["network", "plan_type", "price", "size", "validity"])
   })
   return allPlans
})()

// mtn super jara
exports.superjara_size_map = (size) => {
    const f_size = size.trim().toLowerCase().replace(" ", "")
    let error = false, param;
   
    switch(f_size){
        // sme plans
        case "500mb_sme":
            plan_id = 242;
            break;
        case "1gb_sme":
            plan_id = 234;
            break;
        case "2gb_sme":
            plan_id = 235;
            break;
        case "5gb_sme":
            plan_id = 237;
            break;
        case "10gb_sme":
            plan_id = 246;
            break;
        
        // gifting plans
        case "500mb":
            plan_id = 49;
            break;
        case "1gb":
            plan_id = 208;
            break;
        case "2gb":
            plan_id = 209;
            break;
        case "3gb":
            plan_id = 210;
            break;
        case "5gb":
            plan_id = 211;
            break;
        case "20gb":
            plan_id = 50;
            break;
        case "40gb":
            plan_id = 51;
            break;
        case "15gb":
            plan_id = 52;
            break;
        case "10gb":
            plan_id = 43;
            break;
        case "75gb":
            plan_id = 224;
            break;
        case "100gb":
            plan_id = 225;
            break;
        default:
            error = true;
    }
    
   return {error, param}
}

exports.simservers_size_map = (size) => {
    const f_size = size.trim().toLowerCase().replace(" ", "")
    let error = false, param;
   
    switch(f_size){
        case "100mb":
            param = "airtel_100mb_7days:cg:nil";
            // param = "airtel_100mb_7days:portal:nil";
            break;
        case "300mb":
            param = "airtel_300mb_7days:cg:nil";
            // param = "airtel_300mb_7days:portal:nil";
            break;
        case "500mb":
            param = "airtel_500mb_30days:cg:nil";
            // param = "airtel_500mb_30days:portal:nil";
            break;
        case "1gb":
            param = "airtel_1gb_30days:cg:nil";
            // param = "airtel_1gb_30days:portal:nil";
            break;
        case "2gb":
            param = "airtel_2gb_30days:cg:nil";
            // param = "airtel_2gb_30days:portal:nil";
            break;
        case "5gb":
            param = "airtel_5gb_30days:cg:nil";
            // param = "airtel_5gb_30days:portal:nil";
            break;
        case "10gb":
            param = "airtel_10gb_30days:cg:nil";
            // param = "airtel_10gb_30days:portal:nil";
            break;
        case "15gb":
            param = "airtel_15gb_30days:cg:nil";
            // param = "airtel_15gb_30days:portal:nil";
            break;
        case "20gb":
            param = "airtel_20gb_30days:cg:nil";
            // param = "airtel_20gb_30days:portal:nil";
            break;
        default:
            error = true;
    }
   return {error, param}
}


exports.ogdams_size_map = (size) => {
    const f_size = size.trim().toLowerCase().replace(" ", "")
    let error = false, plan_id;
   
    switch(f_size){
        case "100mb":
            plan_id = 110;
            break;
        case "300mb":
            plan_id = 111;
            break;
        case "500mb":
            plan_id = 112;
            break;
        case "1gb":
            plan_id = 113;
            break;
        case "2gb":
            plan_id = 114;
            break;
        case "5gb":
            plan_id = 115;
            break;
        case "10gb":
            plan_id = 116;
            break;
        case "15gb":
            plan_id = 117;
            break;
        case "20gb":
            plan_id = 118;
            break;
        default:
            error = true;
    }
   return {error, plan_id}
}

exports.ogdams_9mobile_size_map = (size) => {
    const f_size = size.trim().toLowerCase().replace(" ", "")
    let error = false, plan_id;
   
    switch(f_size){
        case "25mb":
            plan_id = 700;
            break;
        case "100mb":
            plan_id = 701;
            break;
        // case "250mb":
        //     plan_id = 73;
        //     break;
        case "300mb":
            plan_id = 716;
            break;
        case "500mb":
            plan_id = 702;
            break;
        case "1gb":
            plan_id = 703;
            break;
        case "1.5gb":
            plan_id = 704;
            break;
        case "2gb":
            plan_id = 705;
            break;
        case "3gb":
            plan_id = 706;
            break;
        case "4gb":
            plan_id = 707;
            break;
        case "4.5gb":
            plan_id = 708;
            break;
        case "5gb":
            plan_id = 709;
            break;
        // case "7gb":
        //     plan_id = 83;
        //     break;
        case "10gb":
            plan_id = 710;
            break;
        case "11gb":
            plan_id = 711;
            break;
        case "15gb":
            plan_id = 717;
            break;
        case "20gb":
            plan_id = 712;
            break;
        case "40gb":
            plan_id = 713;
            break;
        case "50gb":
            plan_id = 714;
            break;
        case "75gb":
            plan_id = 718;
            break;
        case "100gb":
            plan_id = 715;
            break;
        default:
            error = true;
    }
   return {error, plan_id}
}

exports.zoedata_size_map = (size) => {
    const f_size = size.trim().toLowerCase().replace(" ", "")
    let error = false, plan_id;
   
    switch(f_size){
        case "100mb":
            plan_id = 219;
            break;
        case "300mb":
            plan_id = 218;
            break;
        case "500mb":
            plan_id = 217;
            break;
        case "1gb":
            plan_id = 211;
            break;
        case "2gb":
            plan_id = 212;
            break;
        case "5gb":
            plan_id = 213;
            break;
        case "10gb":
            plan_id = 214;
            break;
        case "15gb":
            plan_id = 215;
            break;
        case "20gb":
            plan_id = 216;
            break;
        default:
            error = true;
    }
   return {error, plan_id}
}

exports.cloudsimhost_size_map = (size) => {
    const f_size = size.trim().toLowerCase().replace(" ", "")
    let error = false, plan_id;
   
    switch(f_size){
        case "100mb":
            plan_id = 8;
            break;
        case "300mb":
            plan_id = 11;
            break;
        case "500mb":
            plan_id = 14;
            break;
        case "1gb":
            plan_id = 15;
            break;
        case "2gb":
            plan_id = 16;
            break;
        case "5gb":
            plan_id = 17;
            break;
        case "10gb":
            plan_id = 19;
            break;
        case "15gb":
            plan_id = 20;
            break;
        case "20gb":
            plan_id = 21;
            break;
        default:
            error = true;
    }
   return {error, plan_id}
}


exports.msorg_size_map = (size) => {
    const f_size = size.replace(" ", "").toLowerCase()
    let error = false, plan_id;
    const mul = 1048576;
   
    switch(f_size){
        case "100mb":
            plan_id = 100 * mul;
            break;
        case "300mb":
            plan_id = 300 * mul;
            break;
        case "500mb":
            plan_id = 500 * mul;
            break;
        case "1gb":
            plan_id = 1000 * mul;
            break;
        case "2gb":
            plan_id = 2000 * mul;
            break;
        case "3gb":
            plan_id = 3000 * mul;
            break;
        case "4gb":
            plan_id = 4000 * mul;
            break;
        case "5gb":
            plan_id = 5000 * mul;
            break;
        case "7gb":
            plan_id = 7000 * mul;
            break;
        case "10gb":
            plan_id = 10000 * mul;
            break;
        case "11gb":
            plan_id = 11000 * mul;
            break;
        case "15gb":
            plan_id = 15000 * mul;
            break;
        case "20gb":
            plan_id = 20000 * mul;
            break;
        case "25gb":
            plan_id = 25000 * mul;
            break;
        case "30gb":
            plan_id = 30000 * mul;
            break;
        case "40gb":
            plan_id = 40000 * mul;
            break;
        default:
            error = true;
    }
   return {error, plan_id}
}

exports.cloudsimhost_glo_size_map = (size) => {
    const f_size = size.trim().toLowerCase().replace(" ", "")
    let error = false, plan_id;
   
    switch(f_size){
        case "200mb":
            plan_id = 910;
            break;
        case "500mb":
            plan_id = 912;
            break;
        case "1gb":
            plan_id = 913;
            break;
        case "2gb":
            plan_id = 914;
            break;
        case "3gb":
            plan_id = 915;
            break;
        case "5gb":
            plan_id = 916;
            break;
        case "10gb":
            plan_id = 917;
            break;
        default:
            error = true;
    }
   return {error, plan_id}
}
exports.eazymobile_glo_size_map = (size) => {
    const f_size = size.trim().toLowerCase().replace(" ", "")
    let error = false, plan_id;
   
    switch(f_size){
        case "200mb":
            plan_id = 344;
            break;
        case "500mb":
            plan_id = 345;
            break;
        case "1gb":
            plan_id = 346;
            break;
        case "2gb":
            plan_id = 347;
            break;
        case "3gb":
            plan_id = 348;
            break;
        case "5gb":
            plan_id = 349;
            break;
        case "10gb":
            plan_id = 350;
            break;
        default:
            error = true;
    }
   return {error, plan_id}
}