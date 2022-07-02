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
      
      result.data.push(member);
      // res.send(`${member.user.username} says hello`)
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

const createServer = cl => {
  const app = express()
  app.use(express.json())
  app.use((req, res, next) => {
    // console.log(req.headers))
    if(req.headers.apikey == '' || cfg.server.apiKeyList.indexOf(req.headers.apikey) == -1){
      res.send({message: 'sorry!'});
      return;
    }
    next()
  })

  app.get("/", (_, res) => {
    sendToRole(cl, 'payment', res)
  });

  app.post("/payment/midtrans", (req, res) => {
    // console.log(req.body);
    var payment = req.body;
    var messages = "Payment";
    if (payment.transaction_status == 'settlement') {
      messages = `Payment Invoice ${payment.order_id} sudah lunas pada ${payment.transaction_time}!`
    } else if (payment.transaction_status == 'pending') {
      messages = `Ada pesanan masuk dengan invoice ${payment.orderid} oleh ${payment.customer.email}, segera followup!`
    }
    sendToRole(cl, "payment", res, messages)
    
    // res.json({ requestBody: membersWithRole });
  });

  app.post("/payment/xendit", (req, res) => {
    // console.log(req.body);
    var payment = req.body;
    var messages = "Payment";
    if (payment.transaction_status == 'settlement') {
      messages = `Payment Invoice ${payment.order_id} sudah lunas pada ${payment.transaction_time}!`
    } else if (payment.transaction_status == 'pending') {
      messages = `Ada pesanan masuk dengan invoice ${payment.orderid} oleh ${payment.customer.email}, segera followup!`
    }
    sendToRole(cl, "payment", res, messages)
    
    // res.json({ requestBody: membersWithRole });
  });


  return app
}

const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS);


const client = new Client({ intents: myIntents })
const app = createServer(client)


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