const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const moderationSchema = require("../schemas/moderation");
const mConfig = require("../messageConfig.json");

module.exports = {
  customId: "banBtn",
  userPermissions: [],
  botPermissions: [PermissionFlagsBits.BanMembers],

  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user } = interaction;

    const embedAuthor = message.embeds[0].author;
    const fetchMembers = await guild.members.fetch({
      query: embedAuthor.name,
      limit: 1,
    });
    const targetMember = fetchMembers.first();

    await interaction.deferReply({ ephemeral: true });

    const rEmbed = new EmbedBuilder()
      .setColor(mConfig.embedColorWarning)
      .setFooter({ text: `${client.user.username} - modérer l'utilisateur` })
      .setAuthor({
        name: `${targetMember.user.username}`,
        iconURL: `${targetMember.user.displayAvatarURL({ dynamic: true })}`,
      })
      .setDescription(
        `\`❔\` Pourquoi souhaitez vous bannir ${targetMember.user.username} ?
        \n\`❕\` Tu as 30 secondes pour répondre. Une fois ce délai dépassé l'action de bannissement sera annulé et l'utilisateur sera toujours présent sur le serveur.
        \n\`💡\` Pour bannir sans raison envoyez juste \`.\`
        \n\`💡\` Vous pouvez annuler l'action de bannissement en répondant \`annuler\` (pas sensible au majuscules)`
      );

    interaction.editReply({ embeds: [rEmbed], components: [] });

    const filter = (m) => m.author.id === user.id;
    const reasonCollector = await channel
      .awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] })
      .then((reason) => {
        if (reason.first().content.toLowerCase() === "annuler") {
          reason.first().delete();
          rEmbed
            .setColor(mConfig.embedColorCancel)
            .setDescription("`❌` Action de modération annulée.");
          interaction.editReply({ embeds: [rEmbed] });
          setTimeout(() => {
            message.delete();
          }, 10000);
          return;
        }
        return reason;
      })
      .catch(() => {
        rEmbed
          .setColor(mConfig.embedColorCancel)
          .setDescription("`❌` Action de modération annulée.");
        interaction.editReply({ embeds: [rEmbed] });
        setTimeout(() => {
          message.delete();
        }, 10000);
        return;
      });
    const reasonObj = reasonCollector?.first();
    if (!reasonObj) return;

    let reason = reasonObj.content;
    if (reasonObj.content === ".") {
      reason = "Aucune raison fournie";
    }
    reasonObj.delete();

    targetMember.ban({
      reason: `${reason}`,
      deleteMessageSeconds: 604800,
    });

    let dataGD = await moderationSchema.findOne({ GuildID: guildId });
    const { LogChannelID } = dataGD;
    const loggingChannel = guild.channels.cache.get(LogChannelID);

    const lEmbed = new EmbedBuilder()
      .setColor(mConfig.embedColorCancel)
      .setTitle("`⛔` Utilisateur banni")
      .setAuthor({
        name: targetMember.user.username,
        iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `\`💡\` Pour révoquer le bannisement utilisez : \`/unban ${targetMember.user.id}\``
      )
      .addFields(
        { name: "Banni par", value: `<@${user.id}>`, inline: true },
        { name: "Raison", value: `${reason}`, inline: true }
      )
      .setFooter({
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
        text: `${client.user.username} - Systeme de logs`,
      });

    loggingChannel.send({ embeds: [lEmbed] });

    rEmbed
      .setColor(mConfig.embedColorSuccess)
      .setDescription(
        `\`✅\` ${targetMember.user.username} à été banni avec succès.`
      );

    interaction.editReply({ embeds: [rEmbed] });
    setTimeout(() => {
      message.delete();
    }, 10000);
  },
};
