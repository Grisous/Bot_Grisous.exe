const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const ticketSchema = require("../../schemas/ticketSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-remove-member")
    .setDescription("Retirer un membre d'un ticket")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
    .addUserOption((o) =>
      o
        .setName("utilisateur")
        .setDescription("L'utilisateur que vous voulez retirer du ticket")
        .setRequired(true),
    ),
  userPermissions: [PermissionFlagsBits.ManageThreads],
  botPermissions: [],
  run: async (client, interaction) => {
    try {
      const { guild, channel, options } = interaction;
      await interaction.deferReply();

      const memberToRemove = options.getUser("utilisateur");

      const ticket = await ticketSchema.findOne({
        guildId: guild.id,
        channelId: channel.id,
        closed: false,
      });

      if (!ticket) {
        return interaction.editReply({
          content: "❌ | Ce channel n'est pas un ticket.",
          ephemeral: true,
        });
      }

      const memberExist = guild.members.cache.get(memberToRemove.id);
      if (!memberExist) {
        return interaction.editReply({
          content: "❌ | L'utilisateur n'est pas dans le serveur.",
          ephemeral: true,
        });
      }

      const isNotAdded = channel.permissionsFor(memberExist).has("ViewChannel");
      if (isNotAdded) {
        return interaction.editReply({
          content: "❌ | L'utilisateur n'est pas dans le ticket.",
          ephemeral: true,
        });
      }

      await ticketSchema.findOneAndUpdate(
        {
          guildId: guild.id,
          channelId: channel.id,
          closed: false,
        },
        {
          $pull: { membersAdded: memberToRemove.id },
        },
      );

      await ticket.save();

      await channel.permissionOverwrites.edit(memberExist, {
        ViewChannel: false,
        SendMessages: false,
      });

      return await interaction.editReply({
        content: `✅ | L'utilisateur ${memberToRemove.username} a été retiré du ticket.`,
        ephemeral: false,
      });
    } catch (error) {
      console.error("Erreur dans le ticket-remove-member :", error);
      interaction.reply({
        content: "❌ | Une erreur est survenue lors du retrait du membre.",
        ephemeral: true,
      });
    }
  },
};
