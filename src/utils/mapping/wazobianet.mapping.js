// glo wazobia
exports.wazobia_glo_size_map = (size) => {
  const f_size = size.trim().toLowerCase().replace(" ", "");
  let error = false,
    plan_id;

  switch (f_size) {
    // gifting plans
    case "200mb":
      plan_id = 67;
      break;
    case "500mb":
      plan_id = 68;
      break;
    case "1gb":
      plan_id = 69;
      break;
    case "2gb":
      plan_id = 70;
      break;
    case "3gb":
      plan_id = 71;
      break;
    case "5gb":
      plan_id = 72;
      break;
    case "10gb":
      plan_id = 73;
      break;

    default:
      error = true;
  }

  return { error, plan_id };
};
