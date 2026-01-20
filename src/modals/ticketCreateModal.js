const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");
const ticketSetupSchema = require("../../schemas/ticketSetupSchema");
const ticketSchema = require("../../schemas/ticketSchema");

module.exports = {
  customId: "ticketMdl",
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    try {
      const { guild, fields, member, channel } = interaction;
      const sub = fields.getTextInputValue("ticketSubject");
      const desc = fields.getTextInputValue("ticketDesc");

      await interaction.deferReply({ ephemeral: true });

      const ticketSetup = await ticketSetupSchema.findOne({
        guildId: guild.id,
        ticketChannelId: channel.id,
      });

      const ticketChannel = guild.channels.cache.get(
        ticketSetup.ticketChannelId,
      );
      const staffRole = guild.roles.cache.get(ticketSetup.staffRoleId);
      const username = member.user.globalName ?? member.user.username;

      const ticketEmbed = new EmbedBuilder()
        .setColor("DarkGreen")
        .setAuthor({
          name: username,
          iconURL: member.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`**Sujet :** ${sub}\n**Description :** ${desc}`)
        .setFooter({
          text: `${guildName} - Ticket`,
          iconURL: guild.iconURL({ dynamic: true }),
        });

      const ticketButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("closeTicketBtn")
          .setLabel("Fermer le ticket")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("lockTicketBtn")
          .setLabel("Verrouiller le ticket")
          .setStyle(ButtonStyle.Success),
      );

      let ticket = await ticketSchema.findOne({
        guildId: guild.id,
        ticketMemderID: member.id,
        parentTicketChannelID: ticketChannel.id,
        closed: false,
      });

      const ticketCount = await ticketSchema.countDocuments({
        guildId: guild.id,
        ticketMemderID: member.id,
        parentTicketChannelID: ticketChannel.id,
        closed: true,
      });

      if (ticket) {
        return interaction.editReply({
          content: "❌ | Vous avez déjà un ticket d'ouvert.",
          ephemeral: true,
        });
      }

      const thread = await ticketChannel.threads.create({
        name: `ticket-${username}-${ticketCount + 1}`,
        type: ChannelType.PrivateThread,
        reason: `Ticket créé par ${username}`,
        invitable: false,
        autoArchiveDuration: 1440,
      });

      await thread.send({
        content: `${staffRole} - ticket de ${member}`,
        embeds: [ticketEmbed],
        components: [ticketButtons],
      });

      if (!ticket) {
        ticket = await ticketSchema.create({
          guildId: guild.id,
          ticketMemderID: member.id,
          ticketChannelID: thread.id,
          parentTicketChannelID: channel.id,
          closed: false,
          membersAdded: [],
        });
        await ticket.save().catch((err) => console.log(err));
      }

      return await interaction.editReply({
        content: `✅ | Votre ticket a été créé : ${thread}`,
      });
    } catch (error) {
      console.error("Erreur dans le ticketCreateModal :", error);
      interaction.reply({
        content: "❌ | Une erreur est survenue lors de la création du ticket.",
        ephemeral: true,
      });
    }
  },
};
