const line = require('@line/bot-sdk')
const appress = require('express')
const axios = require('axios').default
const dotenv = require('dotenv')

const env = dotenv.config().parsed
const app = appress()

const lineConfig = {
    channelAccessToken: env.ACCESS_TOKEN,
    channelSecret: env.SECRET_TOKEN
}

const client = new line.messagingApi.MessagingApiClient({
    channelAccessToken: env.ACCESS_TOKEN
  });
  
app.get('/test',async (req ,res) =>{
  res.json(["Tony","Lisa","Michael","Ginger","Food"]);
});

app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
    Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
      return Promise.resolve(null);
    }

    const echo = { type: 'text', text: event.message.text };  
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [echo],
    });
  }
  

const port = env.PORT;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});