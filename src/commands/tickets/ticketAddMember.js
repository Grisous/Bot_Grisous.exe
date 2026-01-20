const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const ticketSchema = require("../../schemas/ticketSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-add-member")
    .setDescription("Ajouter un membre à un ticket")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
    .addUserOption((o) =>
      o
        .setName("utilisateur")
        .setDescription("L'utilisateur que vous voulez ajouter au ticket")
        .setRequired(true),
    ),
  userPermissions: [PermissionFlagsBits.ManageThreads],
  botPermissions: [],
  run: async (client, interaction) => {
    try {
      const { guild, channel, options } = interaction;
      await interaction.deferReply();

      const memberToAdd = options.getUser("utilisateur");

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

      const memberExist = guild.members.cache.get(memberToAdd.id);
      if (!memberExist) {
        return interaction.editReply({
          content: "❌ | L'utilisateur n'est pas dans le serveur.",
          ephemeral: true,
        });
      }

      const isAlreadyAdded = channel
        .permissionsFor(memberExist)
        .has("ViewChannel");
      if (isAlreadyAdded) {
        return interaction.editReply({
          content: "❌ | L'utilisateur est déjà dans le ticket.",
          ephemeral: true,
        });
      }

      ticket.membersAdded.push(memberToAdd.id);
      await ticket.save();
      await channel.permissionOverwrites.edit(memberExist, {
        ViewChannel: true,
        SendMessages: true,
      });

      return await interaction.editReply({
        content: `✅ | L'utilisateur ${memberToAdd.username} a été ajouté au ticket.`,
        ephemeral: false,
      });
    } catch (error) {
      console.error("Erreur dans le ticket-add-member :", error);
      interaction.reply({
        content: "❌ | Une erreur est survenue lors de l'ajout du membre.",
        ephemeral: true,
      });
    }
  },
};
