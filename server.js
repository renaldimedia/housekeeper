// import { createServer } from "./server"
import express from "express"
import { Client, Intents } from "discord.js"

async function getMember(bot){
    // console.log(bot.guilds.cache.get('863733015817486356').members)
    // return
    const list = bot.guilds.cache.get('863733015817486356')
    const members = await list.members.fetch();
    console.log(members)
    // return members
    members.each((member) => {
        return member.user.username;
    })
    return
}

const createServer = client => {
    const app = express()
    
    app.get("/", (_, res) => {
        // client.users.cache.get
        client.users.cache.get('863729310082400267').send('Blabla')
        res.send(`${client.user.username} says hello`)
    })
  
    return app
  }

  const myIntents = new Intents();
  myIntents.add(Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS);
  

const client = new Client({intents: myIntents})
const app = createServer(client)

client.login('OTgzMTkwMzI0MTE1NTQyMDI2.G2JaW3.ROpPcZtFd9VGMeuXmnhLHD3ScYm_MSeOSYs-6c')

app.listen(3000, () => {
  console.log("Express server is listening on port 3000")
});