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

async function sendToRole(cl, role, res, msg = '') {
  try {
    // console.log('will send now to role : ' + cfg.discord.serverKey)
    const list = cl.guilds.cache.get(cfg.discord.serverKey)
    // console.log('list ok')
    const members = await list.members.fetch();
    // console.log('members ok')
    allRoles(cl).then(rs => {
      var item = rs.filter(item=>item.name.toLowerCase().includes(role));
      // console.log(item.keys())
      const [roleid] = item.keys()
      // console.log(roleid)
      members.each((member) => {
        let ada = member.roles.cache.get(roleid);
        if(typeof ada !== 'undefined'){
          // console.log('sending now!')
          client.users.cache.get(member.user.id).send(msg)
          res.send({message: 'Notifikasi terkirim!', error: 0})
          return
        }
      })
      }).catch(error => {
        res.json({message: 'Notifikasi gagal!', error: 1, data: error})
        return
      })
      
  } catch (error) {
    res.send(error)
  }
 
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