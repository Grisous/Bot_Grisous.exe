const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  customId: "cancelBtn",
  userPermissions: [],
  botPermissions: [],

  run: async (client, interaction) => {
    await interaction.message.delete();
    await interaction.reply({
      content: "Commande annulée",
      ephemeral: true,
    });
  },
};
