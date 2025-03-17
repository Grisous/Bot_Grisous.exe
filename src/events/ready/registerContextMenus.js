require("colors");
const { testServerId } = require("../../config.json");
const commandComparing = require("../../utils/commandComparing");
const getApplicationContextMenus = require("../../utils/getApplicationCommands");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");

module.exports = async (client) => {
  try {
    const [localContextMenus, applicationContextMenu] = await Promise.all([
      getLocalContextMenus(),
      getApplicationContextMenus(client, testServerId),
    ]);

    for (const localContextMenu of localContextMenus) {
      const { data, deleted } = localContextMenu;
      const { name: contextMenuName, type: contextMenuType } = data;

      const existingContextMenu = await applicationContextMenu.cache.find(
        (cmd) => cmd.name === contextMenuName
      );

      if (existingContextMenu) {
        if (existingContextMenu.deleted) {
          await applicationContextMenu.delete(existingContextMenu.id);
          console.log(
            `[COMMAND REGISTERY] - Application command ${contextMenuName} has been deleted.`
              .red
          );
          continue;
        }
      } else {
        if (localContextMenu.deleted) {
          console.log(
            `[COMMAND REGISTERY] - Application command ${contextMenuName} has been skipped, since property "deleted" is set to "true".`
              .grey
          );
          continue;
        }
        await applicationContextMenu.create({
          name: contextMenuName,
          type: contextMenuType,
        });
        console.log(
          `[COMMAND REGISTERY] - Application command ${contextMenuName} has been registered.`
            .green
        );
      }
    }
  } catch (error) {
    console.log(
      `[ERROR] - An error occured inside the Context Menu registery:\n ${error}`
        .bgRed
    );
  }
};
