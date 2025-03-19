const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  customId: "cancelBtn",
  userPermissions: [],
  botPermissions: [],

  run: async (client, interaction) => {
    try {
      await interaction.message.delete();
      await interaction.reply({
        content: "Commande annulée",
        ephemeral: true,
      });
      setTimeout(() => {
        interaction.deleteReply();
      }, 10000);
    } catch (error) {
      await interaction.deferReply({ ephemeral: true });
      await interaction.editReply({
        content: "Commande annulée",
        ephemeral: true,
      });
      setTimeout(() => {
        interaction.deleteReply();
      }, 10000);
    }
  },
};
