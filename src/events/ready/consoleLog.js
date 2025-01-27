require("colors");

module.exports = (client) => {
  console.log(`[INFO] - ${client.user.username} is online !`.bgBlue);
  // CODE POUR LEAVE DES SERVEURS VIA L'ID
  //
  // const aleave = []
  // aleave.forEach(element => {
  //   client.guilds.cache.get(element).leave()
  //   console.log(`j'ai leave la guild: ${element}`.bgMagenta)
  // });
  //
  // CODE POUR OBTENIR L'ID ET LES NOMS DES GUILDS CONNUES (celle où il est dedans)
  //
  // const Guilds = client.guilds.cache.map(guild => "ID : " + guild.id + " Serveur : " + guild.name);
  //   console.log(Guilds);

  
}