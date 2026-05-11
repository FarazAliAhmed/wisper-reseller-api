const _ = require("lodash");
const fs = require("fs");

exports.numbers = {
  mtn: [
    "0803",
    "0806",
    "0810",
    "0813",
    "0814",
    "0816",
    "0702",
    "0703",
    "0704",
    "0706",
    "0903",
    "0906",
    "0913",
    "0916",
  ],
  glo: ["0805", "0807", "0811", "0815", "0705", "0905", "0915"],
  airtel: [
    "0802",
    "0808",
    "0812",
    "0701",
    "0708",
    "0901",
    "0902",
    "0904",
    "0907",
    "0912",
    "0911",
  ],
  "9mobile": ["0809", "0817", "0818", "0908", "0909"],
};

exports.units = {
  //what to multiply by, to convert to MB
  gb: 1024,
  mb: 1,
  tb: 1048576,
};

exports.ported_numbers = ["0913", "0912"];

exports.network_ids = {
  1: "mtn",
  2: "glo",
  3: "9mobile",
  4: "airtel",
};

exports.plans = (function () {
  const allPlans = {};
  // const plansJSON = require('./plans.json')
  let plansJSON = JSON.parse(fs.readFileSync(`${__dirname}/plans.json`));
  plansJSON.forEach((planObject) => {
    allPlans[planObject.plan_id] = _.pick(planObject, [
      "network",
      "plan_type",
      "price",
      "size",
      "validity",
    ]);
  });
  return allPlans;
})();

// autopilot
exports.autopilot_mtn_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
    case "500mb":
      plan_id = "MTN_DT_500MB";
      break;
    case "1gb":
      plan_id = "MTN_DT_1GB";
      break;
    case "2gb":
      plan_id = "MTN_DT_2GB";
      break;
    case "3gb":
      plan_id = "MTN_DT_3GB";
      break;
    case "5gb":
      plan_id = "MTN_DT_5GB";
      break;
  }

  return { error, plan_id };
};

// autopilot glo
exports.autopilot_glo_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
    case "500mb":
      plan_id = 6;
      break;
    case "1gb":
      plan_id = 1;
      break;
    case "2gb":
      plan_id = 3;
      break;
    case "3gb":
      plan_id = 2;
      break;
    case "5gb":
      plan_id = 4;
      break;
  }

  return { error, plan_id };
};

// autopilot airtel
exports.autopilot_airtel_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
    case "500mb":
      plan_id = 6;
      break;
    case "1gb":
      plan_id = 1;
      break;
    case "2gb":
      plan_id = 3;
      break;
    case "3gb":
      plan_id = 2;
      break;
    case "5gb":
      plan_id = 4;
      break;
  }

  return { error, plan_id };
};

// mtn n3tdata jara
exports.n3tdata_mtn_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
    // sme plans
    case "500mb":
      plan_id = 6;
      break;
    case "1gb":
      plan_id = 1;
      break;
    case "2gb":
      plan_id = 3;
      break;
    case "3gb":
      plan_id = 2;
      break;
    case "5gb":
      plan_id = 4;
      break;
    case "10gb":
      plan_id = 5;
      break;

    // // gifting plans
    // case "500mb":
    //   plan_id = 7;
    //   break;
    // case "1gb":
    //   plan_id = 8;
    //   break;
    // case "2gb":
    //   plan_id = 9;
    //   break;
    // case "3gb":
    //   plan_id = 10;
    //   break;
    // case "5gb":
    //   plan_id = 11;
    //   break;
    // case "10gb":
    //   plan_id = 12;
    //   break;

    default:
      error = true;
  }

  return { error, plan_id };
};

// 9mobile n3tdata jara
exports.n3tdata_9mobile_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
    // gifting plans
    case "500mb":
      plan_id = 52;
      break;
    case "1gb":
      plan_id = 53;
      break;
    case "2gb":
      plan_id = 54;
      break;
    case "3gb":
      plan_id = 55;
      break;
    case "5gb":
      plan_id = 56;
      break;
    case "10gb":
      plan_id = 57;
      break;
    default:
      error = true;
  }

  return { error, plan_id };
};

// mtn gladtidings - using SME plans (best value)
exports.gladtidings_mtn_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(/\.0\s*/g, '').replace(/\s+/g, '');
  let error = false, plan_id;

  switch (f_size) {
    case "500mb": plan_id = 471;  break; // 500MB DATA SHARE ₦300
    case "1gb":   plan_id = 486;  break; // 1GB SME ₦620
    case "2gb":   plan_id = 506;  break; // 2GB SME ₦1,240
    case "3gb":   plan_id = 355;  break; // 3GB SME ₦1,740
    case "5gb":   plan_id = 356;  break; // 5GB SME ₦1,790
    case "7gb":   plan_id = 593;  break; // 7GB GIFTING ₦3,395
    case "10gb":  plan_id = 539;  break; // 10GB SME ₦4,343
    default: error = true;
  }
  return { error, plan_id };
};

// glo gladtidings - corporate gifting plans
exports.gladtidings_glo_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(/\.0\s*/g, '').replace(/\s+/g, '');
  let error = false, plan_id;

  switch (f_size) {
    case "500mb": plan_id = 331;  break; // 500MB corp gifting ₦198.50
    case "1gb":   plan_id = 334;  break; // 1GB corp gifting ₦397
    case "2gb":   plan_id = 332;  break; // 2GB corp gifting ₦800
    case "3gb":   plan_id = 336;  break; // 3GB corp gifting ₦1,191
    case "5gb":   plan_id = 329;  break; // 5GB corp gifting ₦1,985
    case "10gb":  plan_id = 335;  break; // 10GB corp gifting ₦3,970
    default: error = true;
  }
  return { error, plan_id };
};

// airtel gladtidings - gifting plans (only profitable ones)
exports.gladtidings_airtel_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(/\.0\s*/g, '').replace(/\s+/g, '');
  let error = false, plan_id;

  switch (f_size) {
    case "10gb":  plan_id = 150;  break; // 10GB gifting ₦3,800
    case "15gb":  plan_id = 432;  break; // 18GB gifting ₦5,700
    case "20gb":  plan_id = 436;  break; // 160GB - skip, use 20GB
    default: error = true;
  }
  return { error, plan_id };
};

exports.autopilot_mtn_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id,
    dataType;

  switch (f_size) {
    case "50mb":
      plan_id = "MTN_DT_50MB";
      dataType = "DATA TRANSFER";
      break;
    case "100mb":
      plan_id = "MTN_DT_100MB";
      dataType = "DATA TRANSFER";
      break;
    case "200mb":
      plan_id = "MTN_DT_200MB";
      dataType = "DATA TRANSFER";
      break;
    case "500mb":
      plan_id = "MTN_DT_500MB";
      dataType = "DATA TRANSFER";
      break;
    case "1gb":
      plan_id = "MTN_DT_1GB";
      dataType = "DATA TRANSFER";
      break;
    case "2gb":
      plan_id = "MTN_DT_2GB";
      dataType = "DATA TRANSFER";
      break;
    case "3gb":
      plan_id = "MTN_DT_3GB";
      dataType = "DATA TRANSFER";
      break;
    case "5gb":
      plan_id = "MTN_DT_5GB";
      dataType = "DATA TRANSFER";
      break;
    // Weekly plans (7 days)
    case "500mb_weekly":
    case "500mbweekly":
      plan_id = "MTN_DT_500MB_WK";
      dataType = "DATA TRANSFER";
      break;
    case "1gb_weekly":
    case "1gbweekly":
      plan_id = "MTN_DT_1GB_WK";
      dataType = "DATA TRANSFER";
      break;
    case "2gb_weekly":
    case "2gbweekly":
      plan_id = "MTN_DT_2GB_WK";
      dataType = "DATA TRANSFER";
      break;
    case "3gb_weekly":
    case "3gbweekly":
      plan_id = "MTN_DT_3GB_WK";
      dataType = "DATA TRANSFER";
      break;
    case "5gb_weekly":
    case "5gbweekly":
      plan_id = "MTN_DT_5GB_WK";
      dataType = "DATA TRANSFER";
      break;
    default:
      error = true;
      plan_id = null;
      dataType = null;
  }

  return { error, plan_id, dataType };
};

exports.superjara_mtn_size_map = (size) => {
  // Normalize: "2.0 gb" -> "2gb", "500.0 mb" -> "500mb"
  const f_size = size.trim().toLowerCase()
    .replace(/\.0\s*/g, '')  // remove .0
    .replace(/\s+/g, '');    // remove spaces
  let error = false,
    plan_id,
    dataType;

  switch (f_size) {
    case "500mb":
      plan_id = "mtn_sme_500mb_";
      break;
    case "1gb":
      plan_id = "data_share_1gb";
      break;
    case "2gb":
      plan_id = "data_share_2gb";
      break;
    case "3gb":
      plan_id = "data_share_3gb";
      break;
    case "5gb":
      plan_id = "data_share_5gb";
      break;
    case "7gb":
      plan_id = "data_share_7gb";
      break;
    case "10gb":
      plan_id = "data_share_10gb";
      break;
    case "15gb":
      plan_id = "data_share_15gb";
      break;
    case "20gb":
      plan_id = "data_share_20gb";
      break;
    case "40gb":
      plan_id = "data_share_40gb";
      break;
    default:
      error = true;
  }

  return { error, plan_id, dataType };
};

// 9mobile gladtidings jara
exports.gladtidings_9mobile_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
    case "10mb":
      plan_id = 376;
      break;
    case "15mb":
      plan_id = 377;
      break;
    case "25mb":
      plan_id = 361;
      break;
    case "100mb":
      plan_id = 372;
      break;
    case "500mb":
      plan_id = 182;
      break;
    case "1gb":
      plan_id = 298;
      break;
    case "1.5gb":
      plan_id = 300;
      break;
    case "2gb":
      plan_id = 299;
      break;
    case "3gb":
      plan_id = 303;
      break;
    case "4gb":
      plan_id = 347;
      break;
    case "4.5gb":
      plan_id = 348;
      break;
    case "5gb":
      plan_id = 304;
      break;
    case "10gb":
      plan_id = 305;
      break;
    case "11gb":
      plan_id = 362;
      break;
    case "50gb":
      plan_id = 374;
      break;
    case "100gb":
      plan_id = 391;
      break;
    default:
      error = true;
  }

  return { error, plan_id };
};

// airtel n3tdata jara
exports.n3tdata_airtel_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
    // gifting plans
    case "100mb":
      plan_id = 51;
      break;
    case "300mb":
      plan_id = 50;
      break;
    case "500mb":
      plan_id = 13;
      break;
    case "1gb":
      plan_id = 14;
      break;
    case "2gb":
      plan_id = 15;
      break;
    case "5gb":
      plan_id = 17;
      break;
    case "10gb":
      plan_id = 36;
      break;
    case "15gb":
      plan_id = 58;
      break;
    case "20gb":
      plan_id = 59;
      break;
    default:
      error = true;
  }

  return { error, plan_id };
};

exports.simservers_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    param;

  switch (f_size) {
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
  return { error, param };
};

exports.ogdams_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
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
  return { error, plan_id };
};

exports.ogdams_9mobile_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
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
  return { error, plan_id };
};

exports.zoedata_glo_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
    case "200mb":
      plan_id = 236;
      break;
    case "500mb":
      plan_id = 235;
      break;
    case "1gb":
      plan_id = 229;
      break;
    case "2gb":
      plan_id = 230;
      break;
    case "3gb":
      plan_id = 231;
      break;
    case "5gb":
      plan_id = 232;
      break;
    case "10gb":
      plan_id = 233;
      break;

    default:
      error = true;
  }
  return { error, plan_id };
};

exports.cloudsimhost_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
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
  return { error, plan_id };
};

exports.msorg_size_map = (size) => {
  const f_size = size.replace(" ", "").toLowerCase();
  let error = false,
    plan_id;
  const mul = 1048576;

  switch (f_size) {
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
  return { error, plan_id };
};

// Glo
exports.cloudsimhost_glo_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
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
  return { error, plan_id };
};

exports.eazymobile_glo_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
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
  return { error, plan_id };
};

// AYINLAK

// mtn ayinlak jara
exports.ayinlak_mtn_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
    // sme plans
    case "500mbe":
      plan_id = 6;
      break;
    case "1gbe":
      plan_id = 7;
      break;
    case "2gbe":
      plan_id = 8;
      break;
    case "3gbe":
      plan_id = 250;
      break;
    case "5gbe":
      plan_id = 11;
      break;
    case "10gbe":
      plan_id = 233;
      break;

    // gifting plans
    case "500mb":
      plan_id = 216;
      break;
    case "1gb":
      plan_id = 217;
      break;
    case "2gb":
      plan_id = 218;
      break;
    case "3gb":
      plan_id = 219;
      break;
    case "5gb":
      plan_id = 220;
      break;
    case "10gb":
      plan_id = 221;
      break;
    case "15gb":
      plan_id = 222;
      break;
    case "20gb":
      plan_id = 223;
      break;
    case "40gb":
      plan_id = 224;
      break;
    case "75gb":
      plan_id = 225;
      break;
    case "100gb":
      plan_id = 226;
      break;

    default:
      error = true;
  }

  return { error, plan_id };
};

// airtel ayinlak jara
exports.ayinlak_airtel_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
    // gifting plans
    case "100mb":
      plan_id = 240;
      break;
    case "300mb":
      plan_id = 245;
      break;
    case "500mb":
      plan_id = 244;
      break;
    case "1gb":
      plan_id = 241;
      break;
    case "2gb":
      plan_id = 242;
      break;
    case "5gb":
      plan_id = 243;
      break;
    case "10gb":
      plan_id = 251;
      break;
    case "15gb":
      plan_id = 252;
      break;
    case "20gb":
      plan_id = 253;
      break;

    default:
      error = true;
  }

  return { error, plan_id };
};

// glo n3tdata
exports.n3tdata_glo_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
    // gifting plans
    case "200mb":
      plan_id = 37;
      break;
    case "500mb":
      plan_id = 38;
      break;
    case "1gb":
      plan_id = 39;
      break;
    case "2gb":
      plan_id = 40;
      break;
    case "3gb":
      plan_id = 41;
      break;
    case "5gb":
      plan_id = 42;
      break;
    case "10gb":
      plan_id = 43;
      break;

    default:
      error = true;
  }

  return { error, plan_id };
};

// Superjara GLO size map - confirmed codes from Superjara dashboard
exports.superjara_glo_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(/\.0\s*/g, '').replace(/\s+/g, '');
  let error = false, plan_id;

  switch (f_size) {
    case "2.5gb":   plan_id = "glo_2_5gb30days";    break;
    case "5.8gb":   plan_id = "glo_5_8gb30days";    break;
    case "7.7gb":   plan_id = "glo_7_7gb30days";    break;
    case "10gb":    plan_id = "glo_10gbdays";        break;
    case "13.25gb": plan_id = "glo_13_25gb30days";  break;
    case "18.25gb": plan_id = "glo_18_25gb30days";  break;
    case "29.5gb":  plan_id = "glo_29_5gb30days";   break;
    case "50gb":    plan_id = "glo_50gb30days";      break;
    case "93gb":    plan_id = "glo_93gb30days";      break;
    default: error = true;
  }
  return { error, plan_id };
};

// Superjara Airtel size map - confirmed codes from Superjara dashboard
exports.superjara_airtel_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(/\.0\s*/g, '').replace(/\s+/g, '');
  let error = false, plan_id;

  switch (f_size) {
    case "2gb":  plan_id = "airtel_data_plan_2gb_monthly";  break;
    case "3gb":  plan_id = "airtel_data_plan_3gb_monthly";  break;
    case "4gb":  plan_id = "airtel_data_plan_4gb_30days";   break;
    case "10gb": plan_id = "airtel_data_plan_10gb_30days";  break;
    case "13gb": plan_id = "airtel_data_plan_13gb_30days";  break;
    case "18gb": plan_id = "airtel_data_plan_18gb_30days";  break;
    case "25gb": plan_id = "airtel_data_plan_25gb_30days";  break;
    default: error = true;
  }
  return { error, plan_id };
};

// Superjara 9mobile size map - confirmed codes from Superjara dashboard
exports.superjara_9mobile_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(/\.0\s*/g, '').replace(/\s+/g, '');
  let error = false, plan_id;

  switch (f_size) {
    case "500mb": plan_id = "9mobile_500mb30days";   break;
    case "1.5gb": plan_id = "9mobile_1_5gb30days";   break;
    case "2gb":   plan_id = "9mobile_2gb30days";     break;
    case "3gb":   plan_id = "9mobile_3gb30days";     break;
    case "4.5gb": plan_id = "9mobile_4_5gb30days";   break;
    case "11gb":  plan_id = "9mobile_11gb30days";    break;
    case "15gb":  plan_id = "9mobile_15gb30days";    break;
    case "40gb":  plan_id = "9mobile_40gb30days";    break;
    case "75gb":  plan_id = "9mobile_75gb30days";    break;
    default: error = true;
  }
  return { error, plan_id };
};

// ============================================================
// GSUBZ SIZE MAPS - Fallback when Superjara is down
// Plans from: https://gsubz.com/api/plans?service=mtn_datashare
// ============================================================

// GSUBZ MTN Data Share size map
exports.gsubz_mtn_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(/\.0\s*/g, '').replace(/\s+/g, '');
  let error = false, plan_id, serviceID = "mtn_datashare";

  switch (f_size) {
    case "500mb": plan_id = "179"; break;
    case "1gb":   plan_id = "166"; break;
    case "2gb":   plan_id = "167"; break;
    case "3gb":   plan_id = "168"; break;
    case "5gb":   plan_id = "357"; break;
    default: error = true;
  }
  return { error, plan_id, serviceID };
};

// GSUBZ GLO size map
exports.gsubz_glo_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(/\.0\s*/g, '').replace(/\s+/g, '');
  let error = false, plan_id, serviceID = "glo_data";

  switch (f_size) {
    case "500mb": plan_id = "500";   break;
    case "1gb":   plan_id = "1000";  break;
    case "2gb":   plan_id = "2000";  break;
    case "3gb":   plan_id = "3000";  break;
    case "5gb":   plan_id = "5000";  break;
    case "10gb":  plan_id = "10000"; break;
    default: error = true;
  }
  return { error, plan_id, serviceID };
};

// GSUBZ 9mobile size map
exports.gsubz_9mobile_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(/\.0\s*/g, '').replace(/\s+/g, '');
  let error = false, plan_id, serviceID = "etisalat_data";

  switch (f_size) {
    case "500mb": plan_id = "182"; break;
    case "1gb":   plan_id = "298"; break;
    case "1.5gb": plan_id = "300"; break;
    case "2gb":   plan_id = "299"; break;
    case "3gb":   plan_id = "303"; break;
    case "5gb":   plan_id = "304"; break;
    case "10gb":  plan_id = "305"; break;
    case "11gb":  plan_id = "362"; break;
    default: error = true;
  }
  return { error, plan_id, serviceID };
};
