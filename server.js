// import { createServer } from "./server"
import express from "express"
import { Client, Intents } from "discord.js"
import cfg from "./config.js"

const allRoles = async function(bot){
  const list = bot.guilds.cache.get(cfg.discord.serverKey)
  let roles = await list.roles.fetch();

  return roles;
}

async function getMember(bot, res) {
  // console.log(bot.guilds.cache.get('863733015817486356').members)
  // return
  const list = bot.guilds.cache.get(cfg.discord.serverKey)
  
  if (typeof list !== 'undefined') {
    // let roles = await list.roles.fetch();
    // console.log(roles)
    // return
    const members = await list.members.fetch()
    // console.log(members)
    // return members
    // bot.guilds
    let result = {data: []};
    // result['data'] = [];
    members.each((member) => {
      // bot.users.fetch(member.user.id)
      //   .then(mb => {
      //     // member.roles.cache is a collection of roles the member has
      //     console.log(mb)

      //     if (mb.roles.cache.has('ROLE ID'))
      //       console.log('member has the role')
      //   })
      //   .catch(console.error);
      console.log(member)
      result.data.push(member);
      // res.send(`${member.user.username} says hello`)
    })
    res.json(result)
    return;
  }

  res.send('exit')
}

async function sendToRole(cl, role) {
  const list = cl.guilds.cache.get(cfg.discord.serverKey)
  const members = await list.members.fetch();
  allRoles(cl).then(rs => {
    var item = rs.filter(item=>item.name.toLowerCase().includes(role));
    // console.log(item.keys().get(0))
    const [roleid] = item.keys()
    // console.log(roleid)
    members.each((member) => {
      let ada = member.roles.cache.get(roleid);
      if(typeof ada !== 'undefined'){
        client.users.cache.get(member.user.id).send('Notif ini ada karena anda di set sebagai role: ' + role + " oleh Admin server renaldimedia")
      }
    })
    })
 
}

const createServer = cl => {
  const app = express()
  app.use(express.json())

  app.get("/", (_, res) => {
    sendToRole(cl, 'payment')
    // if(typeof cl )
    // getMember(cl, res)
    // allRoles(cl).then(rs => {
    //   // console.log(rs);

    //   var item = rs.filter(item=>item.name.toLowerCase().includes('hrd'));
    //   console.log(item)
    //   // let x = []
    //   // rs.each(sm => {
    //   //   x.push({
    //   //     name: sm.name,
    //   //     id: sm.id
    //   //   })
    //   // });
    //   // console.log(x)
    // })
  });

  app.post("/payment/midtrans", (req, res) => {
    console.log(req.body);
    var payment = req.body;
    var messages = "Payment";
    if (payment.status == 'ok') {
      messages = `Payment Invoice ${payment.invoice} sudah lunas!`
    } else if (payment.status == 'pending') {
      messages = `Ada pesanan masuk dengan invoice ${payment.invoice}, segera followup!`
    }
    sendToRole(cl, "PAYMENT")
    // client.users.cache.get('863729310082400267').send(messages)
    // res.json({ requestBody: membersWithRole });
  });

  return app
}

const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS);


const client = new Client({ intents: myIntents })
const app = createServer(client)

// function sendFirst(cl, channelID = '') {
//   // let channelID;
//   let channels = cl.channels.cache;
//   console.log(channels);
//   channelLoop:
//   for (let key in channels) {
//     let c = channels[key];
//     console.log(c[1])
//     if (c[2].type === "GUILD_TEXT") {
//       channelID = c[0];
//       break channelLoop;
//     }
//   }

//   let channel = guild.channels.cache.get(guild.systemChannelID || channelID);
//   channel.send(`Hai! saya ${client.user.username}, terimakasih telah invite`);
// }


client.login(cfg.discord.apiKey)

client.once('ready', () => {
  console.log('Ready!');
  // sendFirst(client, '863733017179324440')
  // client.channels.cache.get('863733017179324440').send('Hai! saya bot!');

});

// let membersWithRole = message.guild.members.filter(member => { 
//   return member.roles.find("name", roleName);
// }).map(member => {
//   return member.user.username;
// })
// https://discord.com/channels/863733015817486356/863733017179324440

app.listen(3000, () => {
  console.log("Express server is listening on port 3000")
});