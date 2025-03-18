const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
const moderationSchema = require("../../schemas/moderation");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("moderatesystem")
    .setDescription("Système de modération avancé.")
    .addSubcommand((s) =>
      s
        .setName("configure")
        .setDescription(
          "Configure le système de modération avancé pour le serveur."
        )
        .addChannelOption((o) =>
          o
            .setName("logging_channel")
            .setDescription(
              "Le channel ou seront affiché toutes les logs de modérations."
            )
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((s) =>
      s
        .setName("retirer")
        .setDescription("Supprime le système de modération avancé du serveur.")
    )
    .toJSON(),
  userPermissions: [PermissionFlagsBits.Administrator],
  botPermissions: [],

  run: async (client, interaction) => {
    const { options, guildId, guild } = interaction;
    const subcmd = options.getSubcommand();
    if (!["configure", "retirer"].includes(subcmd)) return;

    const rEmbed = new EmbedBuilder().setFooter({
      iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
      text: `${client.user.username} - Système de modération avancé`,
    });

    switch (subcmd) {
      case "configure":
        const loggingChannel = options.getChannel("logging_channel");

        let dataGD = await moderationSchema.findOne({ GuildID: guildId });
        if (!dataGD) {
          rEmbed
            .setColor(mConfig.embedColorWarning)
            .setDescription(
              "''⌛' Nouveau serveur détecté: configuration du système de modération avancé..."
            );

          await interaction.reply({
            embeds: [rEmbed],
            fetchReply: true,
            ephemeral: true,
          });

          dataGD = new moderationSchema({
            GuildID: guildId,
            LogChannelID: loggingChannel.id,
          });
          dataGD.save();

          rEmbed
            .setColor(mConfig.embedColorSuccess)
            .setDescription(
              "''✅' Sytème de modération avancé configuré avec succès"
            )
            .addFields({
              name: "Logs channel",
              value: `${loggingChannel}`,
              inline: true,
            });

          setTimeout(() => {
            interaction.editReply({ embeds: [rEmbed], ephemeral: true });
          }, 2000);
        } else {
          await moderationSchema.findOneAndUpdate(
            { GuildID: guildId },
            { LogChannelID: loggingChannel.id }
          );

          rEmbed
            .setColor(mConfig.embedColorSuccess)
            .setDescription(
              "''✅' Système de modération avancé mis à jour avec succès"
            )
            .addFields({
              name: "Logs channel",
              value: `${loggingChannel}`,
              inline: true,
            });

          interaction.reply({
            embeds: [rEmbed],
            fetchReply: true,
            ephemeral: true,
          });
        }
        break;
      case "retirer":
        const removed = await moderationSchema.findOneAndDelete({
          GuildID: guildId,
        });

        if (removed) {
          rEmbed
            .setColor(mConfig.embedColorSuccess)
            .setDescription(
              "'✅' Système de modération avancé supprimé avec succès"
            );
        } else {
          rEmbed
            .setColor(mConfig.embedColorError)
            .setDescription(
              "'❌' Impossible de trouver le système de modération avancé. Utilisez `/moderatesystem configure` pour démarrer la configuration du système de modération avancé du serveur."
            );
        }

        interaction.reply({ embeds: [rEmbed], ephemeral: true });
        break;
    }
  },
};
