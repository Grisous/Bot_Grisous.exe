const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("test if work")
    .setDMPermission(false)
    .addSubcommandGroup((subcommandgroup) =>
      subcommandgroup
        .setName("user")
        .setDescription("configure a user.")
        .addSubcommand((subcommand) => 
          subcommand
            .setName("role")
            .setDescription("configure un role")
            .addUserOption((option) =>
              option.setName("user").setDescription("the user to configue")
            )
        )
        .addSubcommand((subcommand) => 
          subcommand
            .setName("nickname")
            .setDescription("configure un nom d'user")
            .addStringOption((option)=> option.setName("nickname").setDescription("le nouveau nickname"))
            .addUserOption((option) =>
              option.setName("user").setDescription("the user to configue")
            )
        )
    ).addSubcommand((subcommand) => 
      subcommand
        .setName("message")
        .setDescription("un message")
    ).toJSON(),
    userPermissions: [PermissionFlagsBits.ManageMessages],
    botPermissions: [PermissionFlagsBits.Connect],
    
    run: (client, interaction) => {
      return interaction.reply("Va te faire je fonctionne enfin !")
    },
    
};
