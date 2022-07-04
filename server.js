// import createServer from "./createServer.js"
import express from "express"
import { Client, Intents, MessageActionRow, MessageButton } from "discord.js"
import { default as FormData } from "form-data"
import cfg from "./config.js"


const allRoles = async function (bot) {
  const list = bot.guilds.cache.get(cfg.discord.serverKey)
  let roles = await list.roles.fetch();

  return roles;
}

async function getMember(bot, res) {

  const list = bot.guilds.cache.get(cfg.discord.serverKey)

  if (typeof list !== 'undefined') {

    const members = await list.members.fetch()

    let result = { data: [] };

    members.each((member) => {
      result.data.push(member);
    })
    res.json(result)
    return;
  }

  res.send('exit')
}


async function sendToRole(cl, role, res, msg = '', additional = false) {
  // console.log(additional)
  try {
    // console.log('will send now to role : ' + cfg.discord.serverKey)
    const list = cl.guilds.cache.get(cfg.discord.serverKey)
    // console.log('list ok')
    const members = await list.members.fetch();
    // var cmp = [];
    console.log('members ok')
    allRoles(cl).then(rs => {
      var item = rs.filter(item => item.name.toLowerCase().includes(role));
      // console.log(item.keys())
      const [roleid] = item.keys()
      console.log(roleid)
      members.each((member) => {
        let ada = member.roles.cache.get(roleid);
        if (typeof ada !== 'undefined') {
          console.log('sending now!')
          if (additional && additional.button == true && ) {
            const row = new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setCustomId(additional.customid)
                  .setLabel(additional.btnlabel)
                  .setStyle(additional.style),
              );
            // cmp.push(row)
            client.users.cache.get(member.user.id).send({ content: msg, components: [row] })
            console.log(msg)
          } else {
            client.users.cache.get(member.user.id).send({ content: msg })
            console.log(msg)
          }
        }
      })
      console.log('berhasil loop member')
      res.json({ message: 'Notifikasi berhasil!', error: 0, data: [] })
    }).catch(error => {
      console.log(error)
    })
  } catch (error) {
    res.json({ msg: "terjadi kesalahan!", er: error })
  }

  return
}

const createServer = cl => {
  const app = express()
  app.use(express.json())
  app.use((req, res, next) => {
    // console.log(req.headers))
    if (req.headers.apikey == '' || cfg.server.apiKeyList.indexOf(req.headers.apikey) == -1) {
      res.send({ message: 'sorry!' });
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
    }
    // else if (payment.transaction_status == 'pending') {
    //   messages = `Ada pesanan masuk dengan invoice ${payment.orderid} oleh ${payment.customer.email}, segera followup!`
    // }
    sendToRole(cl, "payment", res, messages)

    // res.json({ requestBody: membersWithRole });
  });

  app.post("/payment/xendit", (req, res) => {
    // console.log(req.body);
    var payment = req.body;
    var messages = "Payment";
    messages = `Ada pesanan masuk dengan invoice ${payment.external_id} oleh ${payment.payer_email}, segera followup!`
    if (payment.status.toLowerCase() == 'paid') {
      messages = `Payment Invoice ${payment.external_id} sudah lunas pada ${payment.paid_at}!`
    }
    sendToRole(cl, "payment", res, messages)

    // res.json({ requestBody: membersWithRole });
  });

  app.post("/payment/manual", (req, res) => {
    var payment = req.body;
    var messages = "Payment";
    let additional = {
      button: true,
      style: 'PRIMARY',
      customid: 'activatepayment-' + payment.invoice_id + "-" + payment.item_id,
      btnlabel: "Aktivasi paket"
    }
    messages = `Ada pesanan masuk dengan invoice ${payment.invoice_id} oleh ${payment.user_email}, segera followup!`

    sendToRole(cl, "payment", res, messages, additional)

  });


  return app
}


const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS);


const client = new Client({ intents: myIntents })

async function goto(method, url, data, interaction = false) {
  // const users = 
  const result = await cfg.web.request.post(url, data);

  let res = {
    result: result,
    interaction: interaction
  }

  return res
}

client.on('interactionCreate', interaction => {
  if (!interaction.isButton()) return;
  let ids = interaction.customId.split("-");

  if (ids[0] == 'activatepayment') {
    let data = new FormData();
    data.append('item_id', ids[2])
    data.append('invoice_id', ids[1])
    // const data = {
    //   item_id: ids[2],
    //   invoice_id: ids[1]
    // }
    goto('POST', "/wp-json/houzez/v1/payment/activate", data, interaction).then(res => {
      // console.log(result.data)
      // console.log(result.data.message)
      let result = res.result
      let intr = res.interaction
      if (typeof result.data != 'undefined' && typeof result.data.message == 'string' && result.data.message == 'success') {
        let payload = {
          content: 'Berhasil mengaktifkan paket!'
        }
       
        if (result.data.data.phone != '') {
          const row = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setLabel('Say Welcome to New Member')
                .setStyle('LINK').setURL('https://wa.me/' + result.data.data.phone + "/" + encodeURIComponent("Selamat datang di Halorumah!"))
            );

          payload['components'] = [row]
        }
        intr.reply(payload)
        // interaction.deleteReply()
        // client.users.cache.get(interaction.user.id).send(payload)
      }else{
        

        let payload = {
          content: 'Gagal mengaktifkan paket!'
        }
        intr.reply(payload)
        console.log(res.result)
      }
    })

  }

  return true;
});
const app = createServer(client)


client.login(cfg.discord.apiKey)

client.once('ready', () => {
  console.log('Ready!');
});



app.listen(cfg.server.port, () => {
  console.log("Express server is listening on port " + cfg.server.port)
});