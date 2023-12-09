// generate Short URL
const generateRandomPassword = async (length) => {
  const characters =
    "ABCDEFGHIJKLMNOstuvwxyz0123456789PQRSTUVWXYZabcdefghijklmnopqr";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

module.exports = { generateRandomPassword };
