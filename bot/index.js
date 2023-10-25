const line = require('@line/bot-sdk')
const appress = require('express')
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
    .all(req.body.events.map(handleEventTranslate))
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
      replyToken: event.replyToken,messages: [echo],
    });
  }
  

async function handleEventTranslate(event){
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const axios = require('axios')
  const encodedParams = new URLSearchParams();
  encodedParams.set('q', event.message.text);
  encodedParams.set('target', 'th');
  encodedParams.set('source', 'en');

  const options = {
    method: 'POST',
    url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Accept-Encoding': 'application/gzip',
      'X-RapidAPI-Key': '1b518b9aa9msh085f41fea57d530p18c5b8jsn7f3a2b002f0d',
      'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
    },
    data: encodedParams,
  };

  try {
    const response = await axios.request(options);

    const outputString = JSON.stringify(response.data.data.translations[0].translatedText).replace(/"/g, '')
    const echo = { type: 'text', text: outputString };  
    

    return client.replyMessage({
      replyToken: event.replyToken,messages: [echo],
    });
  } catch (error) {
    console.error(error);
  }
}

const port = env.PORT;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});