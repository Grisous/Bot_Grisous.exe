const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const moderationSchema = require("../../schemas/moderation");
const mConfig = require("../../messageConfig.json");
const { userPermissions } = require("../admin/moderatesystem");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Annuler le bannisement un membre du serveur.")
    .addStringOptions((o) =>
      o
        .setName("user_id")
        .setDescription("L'id du membre à débannir.")
        .setRequired(true)
    )
    .toJSON(),
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.BanMembers],

  run: async (client, interaction) => {
    const { options, guildId, guild, member } = interaction;
    const userId = options.getString("user_id");

    let data = await moderationSchema.findOne({ GuildID: guildId });
    if (!data) {
      rEmbed
        .setColor(mConfig.embedColorWarning)
        .setDescription(
          "'❌' Impossible de trouver le système de modération avancé. Utilisez `/moderatesystem configure` pour démarrer la configuration du système de modération avancé du serveur."
        );
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }

    if (userId === member.id) {
      rEmbed
        .setColor(mConfig.embedColorError)
        .setDescription(`${mConfig.unableToInteractWithYourself}`);
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }
    guild.members.unban(userId);

    const rEmbed = new EmbedBuilder()
      .setColor(mConfig.embedColorSuccess)
      .setFooter({
        text: `${client.user.username} - Révocation de bannisement`,
      })
      .setDescription(`\`${member.user.tag}\` a été débanni avec succès.`);
    interaction.reply({ embeds: [rEmbed], ephemeral: true });
  },
};
