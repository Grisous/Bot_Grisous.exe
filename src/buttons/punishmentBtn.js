const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
} = require("discord.js");

module.exports = {
  customId: "punishmentBtn",
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
        .setTitle("Sanctions")
        .setAuthor({
          name: `${targetMember.user.username}`,
          iconURL: `${targetMember.user.displayAvatarURL({ dynamic: true })}`,
        })
        .setDescription(
          `\`❔\` Quelle sanction veux-tu appliquer sur ${targetMember.user.username} ?`
        );

      const otherRow = new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId("banBtn")
          .setLabel("Bannir du sreveur")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("tempbanBtn")
          .setLabel("Bannir temporairement")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("kickBtn")
          .setStyle(ButtonStyle.Danger)
          .setLabel("kick"),
        new ButtonBuilder()
          .setCustomId("tempmuteBtn")
          .setLabel("Exclure (Mute) temporairement")
          .setStyle(ButtonStyle.Secondary),
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
