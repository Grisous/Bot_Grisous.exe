const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonStyle,
  Component,
} = require("discord.js");

module.exports = {
  customId: "otherBtn",
  userPermissions: [],
  botPermissions: [],

  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user } = interaction;

    await interaction.deferReply({ ephemeral: true });

    try {
      const embedAuthor = message.embeds[0].author;
      const fetchMembers = await guild.members.fetch({
        query: embedAuthor.name,
        limit: 1,
      });
      const targetMember = fetchMembers.first();

      const Oembed = new EmbedBuilder()
        .setTitle("Autres options")
        .setAuthor({
          name: `${targetMember.user.username}`,
          iconURL: `${targetMember.user.displayAvatarURL({ dynamic: true })}`,
        })
        .setDescription(
          `\`❔\` Quelle action veux-tu effectuer sur ${targetMember.user.username} ?`
        );

      const otherRow = new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId("renameBtn")
          .setLabel("Renommer")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("addroleBtn")
          .setLabel("Ajouter un role")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("cancelBtn")
          .setLabel("Annuler")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.editReply({ embeds: [Oembed], components: [otherRow] });
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
