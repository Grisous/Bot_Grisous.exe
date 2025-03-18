const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const moderationSchema = require("../schemas/moderation");
const mConfig = require("../messageConfig.json");

module.exports = {
  customId: "renameBtn",
  userPermissions: [PermissionFlagsBits.ManageNicknames],
  botPermissions: [PermissionFlagsBits.ManageNicknames],

  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user } = interaction;

    const embedAuthor = message.embeds[0].author;
    const targetMember = await guild.members;
    const oldUsername = targetMember.user.username
      .fetch({
        query: embedAuthor.name,
        limit: 1,
      })
      .first();
    const tagline = Math.floor(Math.random() * 1000) + 1;

    const rEmbed = new EmbedBuilder()
      .setColor(mConfig.embedColorCancel)
      .setFooter({ text: `${client.user.username} - modérer l'utilisateur` })
      .setAuthor({
        name: `${targetMember.user.username}`,
        iconURL: `${targetMember.user.displayAvatarURL({ dynamic: true })}`,
      })
      .setDescription(
        `\`❔\` Pour quelle raison veux-tu sanctionner le pseudo de ${targetMember.user.username} ?
        \`❕\` Tu as 30 secondes pour indiquer la raison. Une fois ce délai dépassé l'action de rename sera annulé et l'utilisateur conservera son pseudo actuel.
        \n\`💡\` Pour renommer sans raison envoyez juste \`.\`
        \n\`💡\` Vous pouvez annuler l'action de rename en répondant \`annuler\` (pas sensible au majuscules)`
      );

    message.edit({ embeds: [rEmbed], components: [] });

    const filter = (m) => m.author.id === user.id;
    const reasonCollector = await channel
      .awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] })
      .then((reason) => {
        if (reason.first().content.toLowerCase() === "annuler") {
          reason.first().delete();
          rEmbed
            .setColor(mConfig.embedColorCancel)
            .setDescription("`❌` Action de modération annulée.");
          message.edit({ embeds: [rEmbed] });
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
        message.edit({ embeds: [rEmbed] });
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

    targetMember.setNickname(`Pseudo modéré ${tagline}`);

    let dataGD = await moderationSchema.findOne({ GuildID: guildId });
    const { LogChannelID } = dataGD;
    const loggingChannel = guild.channels.cache.get(LogChannelID);

    const lEmbed = new EmbedBuilder()
      .setColor(mConfig.embedColorCancel)
      .setTitle("`✅` Utilisateur renommé")
      .setAuthor({
        name: targetMember.user.username,
        iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `\`💡\` J'ai renommé ${oldUsername} en ${targetMember.user.username}`
      )
      .addFields(
        { name: "renommé par", value: `<@${user.id}>`, inline: true },
        { name: "Raison", value: `${reason}`, inline: true }
      )
      .setFooter({
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
        text: `${client.user.username} - Systeme de logs`,
      });

    loggingChannel.send({ embeds: [lEmbed] });

    rEmbed
      .setColor(mConfig.embedColorSuccess)
      .setDescription(`\`✅\` ${oldUsername} à été renommé avec succès.`);

    message.edit({ embeds: [rEmbed] });
    setTimeout(() => {
      message.delete();
    }, 10000);
  },
};
