const {
  PermissionFlagsBits,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = {
  customId: "tempbanBtn",
  userPermissions: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],

  run: async (client, interaction) => {
    try {
      const tempbanModal = new ModalBuilder()
        .setTitle("Temp Ban")
        .setCustomId("tempbanMdl")
        .setComponents(
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Durée")
              .setCustomId("tempbanTime")
              .setPlaceholder(
                "Durée en minute par défaut, `h` pour heure, `j` pour jour, `m` pour mois"
              )
              .setStyle(TextInputStyle.Short)
          ),
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Raison")
              .setCustomId("tempbanReason")
              .setPlaceholder("Indiquez la raison du bannissement temporaire")
              .setStyle(TextInputStyle.Paragraph)
          )
        );

      return await interaction.showModal(tempbanModal);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content:
          "Une erreur est survenue lors de l'affichage du modal. \n Veuillez en informer @Grisous, mon développer avec l'heure exacte d'apparition de l'erreur.",
        ephemeral: true,
      });
    }
  },
};
