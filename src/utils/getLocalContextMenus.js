const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (exeception = []) => {
  let localContextMenus = [];
  const menuFiles = getAllFiles(path.join(__dirname, "..", "contextmenus"));

  for (const menuFile of menuFiles) {
    const menuObject = require(menuFile);

    if (exeception.includes(menuObject.name)) continue;
    localContextMenus.push(menuObject);
  }

  return localContextMenus;
};
