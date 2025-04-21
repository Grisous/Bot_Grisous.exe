const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (exeception = []) => {
  let localCommands = [];
  const commandCategories = getAllFiles(
    path.join(__dirname, "..", "commands"),
    true
  );

  for (const commandCategory of commandCategories) {
    const commandsFiles = getAllFiles(commandCategory);

    for (const commandsFile of commandsFiles) {
      const commandObject = require(commandsFile);

      if (exeception.includes(commandObject.name)) continue;
      localCommands.push(commandObject);
    }
  }
  return localCommands;
};
