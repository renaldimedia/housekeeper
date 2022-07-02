import createServer from "./createServer.js"
// import express from "express"
import { Client, Intents } from "discord.js"
import cfg from "./config.js"

const allRoles = async function(bot){
  const list = bot.guilds.cache.get(cfg.discord.serverKey)
  let roles = await list.roles.fetch();

  return roles;
}

async function getMember(bot, res) {
  
  const list = bot.guilds.cache.get(cfg.discord.serverKey)
  
  if (typeof list !== 'undefined') {
   
    const members = await list.members.fetch()
    
    let result = {data: []};

    members.each((member) => {
      result.data.push(member);
    })
    res.json(result)
    return;
  }

  res.send('exit')
}


const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS);


const client = new Client({ intents: myIntents })
const app = createServer(client)


client.login(cfg.discord.apiKey)

client.once('ready', () => {
  console.log('Ready!');
});



app.listen(cfg.server.port, () => {
  console.log("Express server is listening on port " + cfg.server.port)
});