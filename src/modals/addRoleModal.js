const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  customId: "addrole_modal",
  userPermissions: [PermissionFlagsBits.MANAGE_ROLES],
  botPermissions: [PermissionFlagsBits.MANAGE_ROLES],

  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user, fields } = interaction;

    try {
      const embedAuthor = message.embeds[0].author;
      const fetchMembers = await guild.members.fetch({
        query: embedAuthor.name,
        limit: 1,
      });
      const targetMember = fetchMembers.first();

      const roleId = fields.getTextInputValue("role_id");
      const role = guild.roles.cache.get(roleId);

      await interaction.deferReply({ ephemeral: true });

      const addedRole = new EmbedBuilder()
        .setAuthor({
          name: `${targetMember.user.username}`,
          iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `${role} à bien été ajouté à ${targetMember.user.username} ?`
        );

      targetMember.roles.add(role).catch((err) => {
        console.log(err);
      });

      return interaction.reply({ embeds: [addedRole], components: [] });
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
