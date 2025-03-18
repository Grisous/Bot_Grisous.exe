const {
  PermissionFlagsBits,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = {
  customId: "tempMuteBtn",
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],

  run: async (client, interaction) => {
    try {
      const tempMuteModal = new ModalBuilder()
        .setTitle("Temp Mute - Exclure temporairement")
        .setCustomId("tempmuteMdl")
        .setComponents(
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Durée")
              .setCustomId("tempmuteTime")
              .setPlaceholder(
                "Durée en minute par défaut, `h` pour heure, `j` pour jour, `m` pour mois"
              )
              .setStyle(TextInputStyle.Short)
          ),
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Raison")
              .setCustomId("tempmuteReason")
              .setPlaceholder("Indiquez la raison de l'expulsion temporaire")
              .setStyle(TextInputStyle.Paragraph)
          )
        );

      return await interaction.showModal(tempMuteModal);
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
