const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Supprime le nombre de message renseigné")
    .addIntegerOption((option) =>
      option
        .setName("nombre")
        .setDescription("Le nombre de message à supprimer")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("cible")
        .setDescription(
          "Supprimer les messages d'un utilisateur spécifique dans le salon"
        )
    ),
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],

  run: async (client, interaction) => {
    const { options, channel, guild } = interaction;
    let amount = options.getInteger("nombre");
    const targetUser = options.getUser("cible");

    if (!amount || amount < 1 || amount > 100) {
      return interaction.reply({
        content: `Veuillez spécifier un nombre de messages à supprimer compris entre 1 et 100.`,
        ephemeral: true,
      });
    }

    try {
      const channelMessages = await channel.messages.fetch();

      if (channelMessages.size === 0) {
        return interaction.reply({
          content: `Il n'y a pas de message à supprimer dans ce salon.`,
          ephemeral: true,
        });
      }

      if (amount > channelMessages.size) amount = channelMessages.size;

      const clearEmbed = new EmbedBuilder().setColor(mConfig.embedColorSuccess);

      await interaction.deferReply({ ephemeral: true });

      let messageToDelete = [];

      if (targetUser) {
        let i = 0;
        channelMessages.forEach((m) => {
          if (
            m.author.id === targetUser.id &&
            messageToDelete.length < amount
          ) {
            messageToDelete.push(m);
            i++;
          }
        });
        let j = 0;
        while (j < messageToDelete.length) {
          m = messageToDelete[j];
          if (
            new Date(m.createdAt) < new Date(Date.now() - 60 * 60 * 24 * 14)
          ) {
            let notDel = amount - j;
            let multiNotDel = amount === (0 || 1) ? "message" : "messages";
            clearEmbed.addFields({
              name: `${multiNotDel} non supprimable`,
              value: `${notDel} ${multiNotDel} n'ont pas été supprimé car ils ont été envoyé il y a plus de 14 jours`,
              inline: true,
            });
            amount = j;
            break;
          }
          j++;
        }
        const multimsg = amount === (1 || 0) ? "message" : "messages";

        clearEmbed.setDescription(
          `\`✅\` ${amount} ${multimsg} envoyé par ${targetUser} dans ${channel} ont été supprimé`
        );
      } else {
        messageToDelete = channelMessages.first(amount);
        let j = 0;
        while (j < messageToDelete.length) {
          m = messageToDelete[j];
          if (
            new Date(m.createdAt) < new Date(Date.now() - 60 * 60 * 24 * 14)
          ) {
            let notDel = amount - j;
            let multiNotDel = amount === (0 || 1) ? "message" : "messages";
            clearEmbed.addFields({
              name: `${multiNotDel} non supprimable`,
              value: `${notDel} ${multiNotDel} n'ont pas été supprimé car ils ont été envoyé il y a plus de 14 jours`,
              inline: true,
            });
            amount = j;
            break;
          }
          j++;
        }
        const multimsg = amount === (1 || 0) ? "message" : "messages";

        clearEmbed.setDescription(
          `\`✅\` ${amount} ${multimsg} dans ${channel} ont été supprimé`
        );
      }

      if (messageToDelete.length > 0) {
        await channel.bulkDelete(messageToDelete, true);
      }

      await interaction.editReply({ embeds: [clearEmbed] });
    } catch (error) {
      console.log(error);
      await interaction.followUp({
        content: `Une erreur est survenue lors de la suppression`,
        ephemeral: true,
      });
    }
  },
};
