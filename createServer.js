import express from "express"
import cfg from "./config.js"

// import { Client, Intents } from "discord.js"

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
    res.send("terjadi kesalahan!")
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
  });

  app.post("/payment/xendit", (req, res) => {
    var payment = req.body;
    var messages = "Payment";
    messages = `Ada pesanan masuk dengan invoice ${payment.external_id} oleh ${payment.payer_email}, segera followup!`
    if (payment.status.toLowerCase() == 'paid') {
      messages = `Payment Invoice ${payment.external_id} sudah lunas pada ${payment.paid_at} oleh ${payment.payer_email}!`
    }
    sendToRole(cl, "payment", res, messages)
  });

  app.post("/payment/manual", (req,res) => {
    var payment = req.body;
    res.json(req);
  });


  return app
}
export default createServer