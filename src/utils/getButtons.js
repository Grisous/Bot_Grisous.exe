const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (exeception = []) => {
  let buttons = [];
  const buttonFiles = getAllFiles(path.join(__dirname, "..", "buttons"));

  for (const buttonFile of buttonFiles) {
    const buttonObject = require(buttonFile);

    if (exeception.includes(buttonObject.name)) continue;
    buttons.push(buttonObject);
  }

  return buttons;
};
