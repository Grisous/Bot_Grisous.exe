require("colors");

const {testServerId} = require("../../config.json");
const commandComparing = require("../../utils/commandComparing");
const getApplicationContextMenus = require("../../utils/getApplicationCommands");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");

module.exports = async (client) => {
  try {
    const [localCommands, applicationContextMenu] = await Promise.all([
      getLocalContextMenus(),
      getApplicationContextMenus(client, testServerId),
    ]);

    for (const localCommand of localCommands) {
      const {data, deleted} = localCommand;
      const {
        name : contextMenuName,
        type: contextMenuType,
      } = data;

      const existingContextMenu = await applicationContextMenu.cache.find(
        (cmd) => cmd.name === contextMenuName
      );

      if (deleted) {
        if (existingContextMenu) {
          await applicationContextMenu.delete(existingContextMenu.id);
          console.log(`[COMMAND REGISTERY] - Application command ${contextMenuName} has been deleted.`
            .red
          );
        } else {
          console.log(`[COMMAND REGISTERY] - Application command ${contextMenuName} has been skipped, since property "deleted" is set to "true".`
            .grey
          );
        }
      } else if (existingContextMenu) {
        if (commandComparing(existingContextMenu, localCommand)) {
          await applicationContextMenu.edit(existingContextMenu.id, {
            name: contextMenuName,
            description: contextMenuType,
            options: commandOptions,
          });
          console.log(`[COMMAND REGISTERY] - Application command ${contextMenuName} has been edited.`
            .yellow
          );
        }
      } else {
        await applicationContextMenu.create({
          name: contextMenuName,
          description: contextMenuType,
          options: commandOptions,
        });
        console.log(`[COMMAND REGISTERY] - Application command ${contextMenuName} has been registered.`
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