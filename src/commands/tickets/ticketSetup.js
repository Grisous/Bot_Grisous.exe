const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ticketSetupSchema = require("../../schemas/ticketSetupSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-setup")
    .setDescription("Configurer le système de ticket")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("ticket-feedback")
        .setDescription("Le channel où les tickets seront envoyés")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("ticket-channel")
        .setDescription("Le channel où les tickets seront créés")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("staff-role")
        .setDescription("Le role staff qui aura accès aux tickets")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("ticket-type")
        .setDescription(
          "Le type de ticket que vous voulez utiliser. \nModal signifie que l'utilisateur recevra une fenêtre demandant des informations supplémentaires avant la création du ticket. \nButton signifie que lorsque l'utilisateur appuyera sur le bouton, le ticket sera directement créé."
        )
        .addChoices(
          { name: "Modal", value: "modal" },
          { name: "Bouton", value: "button" }
        )
        .setRequired(true)
    ),
  userPermissions: [PermissionFlagsBits.Administrator],
  botPermissions: [],
  run: async (client, interaction) => {
    try {
      const { guild, options } = interaction;
      const ticketFeedbackChannel = options.getChannel("ticket-feedback");
      const ticketChannel = options.getChannel("ticket-channel");
      const staffRole = options.getRole("staff-role");
      const ticketType = options.getString("ticket-type");

      await interaction.deferReply({ ephemeral: true });

      const buttonTicketCreateEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Système de ticket")
        .setDescription(
          "Cliquez sur le bouton ci-dessous pour créer un ticket."
        )
        .setFooter({ text: "Support Tickets" })
        .setTimestamp();

      const modalTicketCreateEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Système de ticket")
        .setDescription(
          "Cliquez sur le bouton ci-dessous pour créer un ticket."
        )
        .setFooter({ text: "Support Tickets" })
        .setTimestamp();

      const ticketSetupEmbed = new EmbedBuilder()
        .setColor("DarkGreen")
        .setTitle("Configuration du système de ticket")
        .setDescription("Le système de ticket a été configuré avec succès !")
        .addFields(
          {
            name: "Channel de feedback",
            value: `${ticketFeedbackChannel}`,
            inline: true,
          },
          {
            name: "Channel de ticket",
            value: `${ticketChannel}`,
            inline: true,
          },
          { name: "Role staff", value: `${staffRole}`, inline: true },
          { name: "Type de ticket", value: `${ticketType}`, inline: true }
        )
        .setFooter({ text: "Support Tickets" })
        .setTimestamp();

      const openTicketButton = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setCustomId("supportTicketButton")
          .setLabel("Ouvrir un ticket")
          .setStyle(ButtonStyle.Secondary),
      ]);

      let setupTicket = await ticketSetupSchema.findOne({
        ticketChannelID: ticketChannel.id,
      });

      if (setupTicket) {
        return await interaction.editReply({
          content: "Le système de ticket est déjà configuré.",
          ephemeral: true,
        });
      } else {
        setupTicket = await ticketSetupSchema.create({
          guildID: guild.id,
          feedbackChannelID: ticketFeedbackChannel.id,
          ticketChannelID: ticketChannel.id,
          staffRoleID: staffRole.id,
          ticketType: ticketType,
        });

        await setupTicket.save().catch((err) => console.log(err));
      }

      if (ticketType === "button") {
        await ticketChannel.send({
          embeds: [buttonTicketCreateEmbed],
          components: [openTicketButton],
        });
      } else {
        await ticketChannel.send({
          embeds: [modalTicketCreateEmbed],
          components: [openTicketButton],
        });
      }

      return await interaction.editReply({
        embeds: [ticketSetupEmbed],
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content:
          "Une erreur est survenue lors de la configuration du système de tickets.",
        ephemeral: true,
      });
    }
  },
};
