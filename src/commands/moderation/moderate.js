const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const moderationSchema = require("../../schemas/moderation");
const mConfig = require("../../messageConfig.json");
const { userPermissions } = require("../admin/moderatesystem");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("moderer")
    .setDescription("Modérer un membre du serveur.")
    .addUserOption((o) =>
      o.setName("user").setDescription("Le membre à modérer.").setRequired(true)
    )
    .toJSON(),
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [],

  run: async (client, interaction) => {
    const { options, guildId, guild, member } = interaction;

    const user = options.getUser("user");
    const targetMember = await guild.members.fetch(user);

    const rEmbed = new EmbedBuilder()
      .setColor("FFFFFF")
      .setFooter({ text: `${client.user.username} - modérer l'utilisateur` });

    let data = await moderationSchema.findOne({ GuildID: guildId });
    if (!data) {
      rEmbed
        .setColor(mConfig.embedColorError)
        .setDescription(
          `\'❌\' Impossible de trouver le système de modération avancé. Utilisez \`/moderatesystem configure\` pour démarrer la configuration du système de modération avancé du serveur.`
        );
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }

    if (targetMember.id === member.id) {
      rEmbed
        .setColor(mConfig.embedColorError)
        .setDescription(`${mConfig.unableToInteractWithYourself}`);
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }

    if (targetMember.roles.highest.position >= member.roles.highest.position) {
      rEmbed
        .setColor(mConfig.embedColorError)
        .setDescription(`${mConfig.hasHigherRolePosition}`);
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }

    const moderationButtons = new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId("banbtn")
        .setLabel("Bannir du sreveur")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("kickbtn")
        .setStyle(ButtonStyle.Danger)
        .setLabel("kick"),
      new ButtonBuilder()
        .setCustomId("cancelbtn")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("Annuler")
    );

    rEmbed
      .setAuthor({
        name: `${targetMember.user.username}`,
        iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `\`❔\` Quelle action veux-tu effectuer sur ${targetMember.user.username} ?`
      );
    interaction.reply({ embeds: [rEmbed], components: [moderationButtons] });
  },
};
