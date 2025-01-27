require("colors");
const mongoose = require("mongoose");
const mongoURL = process.env.MONGO_URL;
module.exports = async (client) => {
  console.log(`[INFO] - ${client.user.username} is online !`.bgBlue);

  if (!mongoURL) return;
  mongoose.set("strictQuery", true);

  
  if (await mongoose.connect(mongoURL)) {
    console.log(`[INFO] - Connected to the Database MongoDB !`.green);
  }
  
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
  const Guilds = client.guilds.cache.map(guild => "ID : " + guild.id + " Serveur : " + guild.name);
  console.log(Guilds);


}