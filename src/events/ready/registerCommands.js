require("colors");

const {testServerId} = require("../../config.json");
const commandComparing = require("../../utils/commandComparing");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");

module.exports = async (client) => {
  try {
    const [localCommands, applicationCommands] = await Promise.all([
      getLocalCommands(),
      getApplicationCommands(client, testServerId),
    ]);

    for (const localCommand of localCommands) {
      const {data, deleted} = localCommand;
      const {
        name : comandName,
        description: comandDescription,
        options: commandOptions,
      } = data;

      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === commandName
      );

      if (deleted) {
        if (existingCommand) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`[COMMAND REGISTERY] - Application command ${commandName} has been deleted.`
            .red
          );
        } else {
          console.log(`[COMMAND REGISTERY] - Application command ${commandName} has been skipped, since property "deleted" is set to "true".`
            .grey
          );
        }
      } else if (existingCommand) {
        if (commandComparing(existingCommand, commandOptions)) {
          await applicationCommands.edit(existingCommand.id, {
            name: comandName,
            description: comandDescription,
            options: commandOptions,
          });
          console.log(`[COMMAND REGISTERY] - Application command ${commandName} has been edited.`
            .yellow
          );
        }
      } else {
        await applicationCommands.create({
          name: comandName,
          description: comandDescription,
          options: commandOptions,
        });
        console.log(`[COMMAND REGISTERY] - Application command ${commandName} has been registered.`
          .green
        );
      }
    }
  } catch (error) {
    console.log(`[ERROR] - An error occured inside the command registery:\n ${error}`
      .bgRed
    );
  }
}