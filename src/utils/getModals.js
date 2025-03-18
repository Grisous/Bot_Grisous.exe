const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (exeception = []) => {
  let modals = [];
  const modalFiles = getAllFiles(path.join(__dirname, "..", "modals"));

  for (const modalFile of modalFiles) {
    const modalObject = require(modalFile);

    if (exeception.includes(modalObject.name)) continue;
    modals.push(modalObject);
  }

  return modals;
};
