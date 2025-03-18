const {
  PermissionFlagsBits,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = {
  customId: "addroleBtn",
  userPermissions: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],

  run: async (client, interaction) => {
    try {
      const addroleMdl = new ModalBuilder()
        .setTitle("Ajouter un rôle")
        .setCustomId("addroleMdl")
        .setComponents(
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Role ID")
              .setCustomId("role_id")
              .setPlaceholderText(
                "Exemple : 1351152819075547172 \n Vous pouvez le récupérer uniquement avec le mode développeur activé"
              )
              .setStyle(TextInputStyle.Short)
          )
        );

      return await interaction.showModal(addroleMdl);
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
