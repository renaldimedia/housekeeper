// import createServer from "./createServer.js"
import express from "express"
import { Client, Intents, MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
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


async function sendToRole(cl, role, res, payload) {
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
          client.users.cache.get(member.user.id).send(payload)
          console.log(payload.content)
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
    // sendToRole(cl, 'payment', res, {content: ""})
    res.send("404");
  });

  app.post("/payment/midtrans", (req, res) => {
    var payment = req.body;
    var messages = "Payment";
    if (payment.transaction_status == 'settlement') {
      messages = `Payment Invoice ${payment.order_id} sudah lunas pada ${payment.transaction_time}!`
    }
    sendToRole(cl, "payment", res, {content: messages})
  });

  app.post("/payment/xendit", (req, res) => {

    var payment = req.body;
    var messages = "Payment";
    messages = `Ada pesanan masuk dengan invoice ${payment.external_id} oleh ${payment.payer_email}, segera followup!`
    if (payment.status.toLowerCase() == 'paid') {
      messages = `Payment Invoice ${payment.external_id} sudah lunas pada ${payment.paid_at}!`
    }
    sendToRole(cl, "payment", res, {content: messages})
  });

  app.post("/payment/manual", (req, res) => {
    var payment = req.body;
    var messages = "Payment";
    const row = new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setCustomId('activatepayment-' + payment.invoice_id + "-" + payment.item_id)
                  .setLabel("Aktivasi paket")
                  .setStyle('PRIMARY'),
              );
    messages = `Ada pesanan masuk dengan invoice ${payment.invoice_id} oleh ${payment.user_email}, segera followup!`
    sendToRole(cl, "payment", res, {content: messages, components: [row]})
  });

  app.get("/payment/report", (__, res) => {
    const exampleEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Some title')
      .setURL('https://discord.js.org/')
      .setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
      .setDescription('Some description here')
      .setThumbnail('https://i.imgur.com/AfFp7pu.png')
      .addFields(
        { name: 'Regular field title', value: 'Some value here' },
        { name: '\u200B', value: '\u200B' },
        { name: 'Inline field title', value: 'Some value here', inline: true },
        { name: 'Inline field title', value: 'Some value here', inline: true },
      )
      .addField('Inline field title', 'Some value here', true)
      .setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

    sendToRole(cl, 'dev', res, {content:"Boo", embeds: [exampleEmbed]});

    return;
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
    interaction.reply("Mohon tunggu...")
    // let data = new FormData();
    // data.append('item_id', ids[2])
    // data.append('invoice_id', ids[1])
    const data = JSON.stringify({
      item_id: ids[2],
      invoice_id: ids[1]
    })
    goto('POST', "/wp-json/houzez/v1/payment/activate", data, interaction).then(res => {
      // interaction.deferReply()
      let result = res.result
      let intr = res.interaction
      // console.log(result.data)
      // console.log(interaction)
      if (typeof result.data != 'undefined' && typeof result.data.message == 'string' && result.data.message == 'success') {
        let payload = {
          content: 'Berhasil mengaktifkan paket!'
        }

        if (result.data.data.phone != '') {
          const row = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setLabel('Say Welcome to New Member')
                .setStyle('LINK').setURL('https://api.whatsapp.com/send?phone=' + result.data.data.phone + "&text=" + encodeURIComponent("Selamat datang di Halorumah!"))
            );

          payload['components'] = [row]
        }
        try {
          interaction.followUp(payload)
          // intr(payload)
        } catch (error) {
          console.log(error)
        }

      } else {


        let payload = {
          content: 'Gagal mengaktifkan paket!'
        }
        try {
          interaction.followUp(payload)
          // intr.reply(payload)
        } catch (error) {
          console.log(error)
        }
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