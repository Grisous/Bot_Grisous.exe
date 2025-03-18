const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const mConfig = require("../messageConfig.json");
const moderationSchema = require("../schemas/moderation");

module.exports = {
  customId: "tempbanMdl",
  userPermissions: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],

  run: async (client, interaction) => {
    const { message, guildId, guild, user, fields } = interaction;

    try {
      const embedAuthor = message.embeds[0].author;
      const fetchMembers = await guild.members.fetch({
        query: embedAuthor.name,
        limit: 1,
      });
      const targetMember = fetchMembers.first();

      const banTime = fields.getTextInputValue("tempbanTime");
      const banReason = fields.getTextInputValue("tempbanReason");

      function parseDuration(durationString) {
        const regex = /(\d+)([hmd])/g;
        let duration = 0;
        let match;

        while ((match = regex.exec(durationString))) {
          const value = parseInt(match[1]);
          const unit = match[2];
          console.log("unit" + unit);

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
            case null:
              duration += value * 60 * 1000;
          }
        }
        if (duration === 0) throw "Bah jsp j'passe pas dans le while";
        return duration;
      }

      const banDuration = parseDuration(banTime);

      const banEndTime = Math.floor((Date.now() + banDuration) / 1000);
      console.log(
        `${banTime}\nparse : ${parseDuration(
          banTime
        )} \n end time : ${Math.floor((Date.now() + banDuration) / 1000)}`
      );
      await interaction.deferReply({ ephemeral: false });

      const bEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${targetMember.user.username}`,
          iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `${targetMember.user.username} à été banni jusqu'à <t:${banEndTime}:R> pour la raison suivante : ${banReason}`
        );

      await interaction.editReply({ embeds: [bEmbed], components: [] });

      targetMember.ban({
        reason: `BAN TEMPORAIRE : ${banReason}`,
        deleteMessageSeconds: 604800,
      });

      const maxTimeoutDuration = 2147483647;

      if (banDuration <= maxTimeoutDuration) {
        setTimeout(async () => {
          await guild.members.unban(targetMember.id);
        }, banDuration);
      } else {
        const remainingBanDuration = banDuration - maxTimeoutDuration;
        setTimeout(async () => {
          await guild.members.unban(targetMember.id);
        }, maxTimeoutDuration);

        setTimeout(async () => {
          await guild.members.unban(targetMember.id);
        }, remainingBanDuration);
      }

      let dataGD = await moderationSchema.findOne({ GuildID: guildId });
      const { LogChannelID } = dataGD;
      const loggingChannel = guild.channels.cache.get(LogChannelID);

      const lEmbed = new EmbedBuilder()
        .setColor(mConfig.embedColorCancel)
        .setTitle("`⛔` Utilisateur banni temporairement")
        .setAuthor({
          name: targetMember.user.username,
          iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `\`💡\` Pour révoquer le bannisement utilisez : \`/unban ${targetMember.user.id}\``
        )
        .addFields(
          {
            name: "Banni temporairement par",
            value: `<@${user.id}>`,
            inline: true,
          },
          { name: "Fin du ban", value: `<t:${banDuration}:R>` },
          { name: "Raison", value: `${banReason}`, inline: true }
        )
        .setFooter({
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
          text: `${client.user.username} - Systeme de logs`,
        });

      loggingChannel.send({ embeds: [lEmbed] });

      lEmbed
        .setColor(mConfig.embedColorSuccess)
        .setDescription(
          `\`✅\` ${targetMember.user.username} à été banni temporairement avec succès.`
        );

      interaction.editReply({ embeds: [lEmbed] });
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
