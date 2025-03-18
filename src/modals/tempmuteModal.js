const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const mConfig = require("../messageConfig.json");
const moderationSchema = require("../schemas/moderation");

module.exports = {
  customId: "tempmuteMdl",
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],

  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user, fields } = interaction;

    try {
      const embedAuthor = message.embeds[0].author;
      const fetchMembers = await guild.members.fetch({
        query: embedAuthor.name,
        limit: 1,
      });
      const targetMember = fetchMembers.first();

      const muteTime = fields.getTextInputValue("tempmuteTime");
      const muteReason = fields.getTextInputValue("tempmuteReason");

      function parseDuration(durationString) {
        const regex = /(\d+)([hmd])/g;
        let duration = 0;
        let match;

        while ((match = regex.exec(durationString))) {
          const value = parseInt(match[1]);
          const unit = match[2];

          switch (unit) {
            case "h":
              duration += value * 60 * 60 * 1000;
              break;
            case "d":
              duration += value * 24 * 60 * 60 * 1000;
              break;
            case "m":
              duration += value * 30 * 24 * 60 * 60 * 1000;
              break;
            default:
              duration += value * 60 * 1000;
          }
        }
        return duration;
      }

      const muteDuration = parseDuration(muteTime);

      const muteEndTime = Math.floor((Date.now() + muteDuration) / 1000);

      const bEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${targetMember.user.username}`,
          iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `${targetMember.user.username} à été exclu jusqu'à <t:${muteEndTime}:R> pour la raison suivante : ${muteReason}`
        );

      await interaction.deferReply({ ephemeral: false });

      targetMember.timeout({
        timeout: muteDuration,
        reason: `EXPULSION TEMPORAIRE : ${muteReason}`,
      });

      let dataGD = await moderationSchema.findOne({ GuildID: guildId });
      const { LogChannelID } = dataGD;
      const loggingChannel = guild.channels.cache.get(LogChannelID);

      const lEmbed = new EmbedBuilder()
        .setColor(mConfig.embedColorCancel)
        .setTitle("`⛔` Utilisateur exclu temporairement")
        .setAuthor({
          name: targetMember.user.username,
          iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
        })
        .addFields(
          {
            name: "Exclu temporairement par",
            value: `<@${user.id}>`,
            inline: true,
          },
          { name: "Fin de l'exclusion", value: `<t:${muteDuration}:R>` },
          { name: "Raison", value: `${muteReason}`, inline: true }
        )
        .setFooter({
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
          text: `${client.user.username} - Systeme de logs`,
        });

      loggingChannel.send({ embeds: [lEmbed] });

      rEmbed
        .setColor(mConfig.embedColorSuccess)
        .setDescription(
          `\`✅\` ${targetMember.user.username} à été exclu temporairement avec succès.`
        );

      message.edit({ embeds: [rEmbed] });
      setTimeout(() => {
        message.delete();
      }, 10000);
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
