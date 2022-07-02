import express from "express"
import cfg from "./config.js"


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
    messages = `Ada pesanan masuk dengan invoice ${payment.external_id} oleh ${payment.payer_email}, segera followup!`
    if (payment.status.toLowerCase() == 'paid') {
      messages = `Payment Invoice ${payment.external_id} sudah lunas pada ${payment.paid_at}!`
    }
    sendToRole(cl, "payment", res, messages)
    
    // res.json({ requestBody: membersWithRole });
  });


  return app
}
export default createServer