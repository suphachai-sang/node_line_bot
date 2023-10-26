const line = require('@line/bot-sdk')
const appress = require('express')
const dotenv = require('dotenv')
const axios = require('axios')
const env = dotenv.config().parsed
const app = appress()

const lineConfig = {
    channelAccessToken: env.ACCESS_TOKEN,
    channelSecret: env.SECRET_TOKEN
}

const client = new line.messagingApi.MessagingApiClient({
    channelAccessToken: env.ACCESS_TOKEN
  });

// get test -----------------------------------------------------
app.get('/test',async (req ,res) =>{
  res.json(["Tony","Lisa","Michael","Ginger","Food"]);
});

// webhook -----------------------------------------------------
app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
    Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
        console.error(err);
        res.status(500).end();
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
});

// webhookTranslate -----------------------------------------------------
app.post('/webhookTranslate', line.middleware(lineConfig), async (req, res) => {
  Promise
  .all(req.body.events.map(handleEvent))
  .then((result) => res.json(result))
  .catch((err) => {
      console.error(err);
      res.status(500).end();
  });

  async function handleEvent(event){
    if (event.type !== 'message' || event.message.type !== 'text') {
      return Promise.resolve(null);
    }
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
});

// webhookWord -----------------------------------------------------
app.post('/webhookWord', line.middleware(lineConfig), async (req, res) => {
  Promise
  .all(req.body.events.map(handleEvent))
  .then((result) => res.json(result))
  .catch((err) => {
      console.error(err);
      res.status(500).end();
  });

  async function handleEvent(event){
    if (event.type !== 'message' || event.message.type !== 'text') {
      return Promise.resolve(null);
    }
  
    const options = {
      method: 'GET',
      url: 'https://wordsapiv1.p.rapidapi.com/words/'+ event.message.text,
      headers: {
        'X-RapidAPI-Key': '1b518b9aa9msh085f41fea57d530p18c5b8jsn7f3a2b002f0d',
        'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
      }
    };
  
    try {
      const response = await axios.request(options);
      let concatenatedDefinitions = ''
     
      for (let i = 0; i < response.data.results.length; i++) {
        const result = response.data.results[i];
        concatenatedDefinitions += `Definition ${i+1}:\n`;
        concatenatedDefinitions += `-: ${result.definition}\n`;
        concatenatedDefinitions += `Part of Speech: ${result.partOfSpeech}\n`;

        if (result.examples) {
          for(const tx of result.examples) {
            concatenatedDefinitions += `Examples: ${tx}\n`;
          }    
        }
        concatenatedDefinitions += '\n';
      }

      console.log(concatenatedDefinitions);
      const echo = { type: 'text', text: concatenatedDefinitions };  
      
      return client.replyMessage({
        replyToken: event.replyToken,messages: [echo],
      });
    } catch (error) {
      console.error(error);
    }
  }
});

// test word -----------------------------------------------------
app.get('/testword',async (req ,res) =>{
    const options = {
      method: 'GET',
      url: 'https://wordsapiv1.p.rapidapi.com/words/love',
      headers: {
        'X-RapidAPI-Key': '1b518b9aa9msh085f41fea57d530p18c5b8jsn7f3a2b002f0d',
        'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
      }
    };
  
    try {
      const response = await axios.request(options);
      let concatenatedDefinitions = ''
     
      for (let i = 0; i < response.data.results.length; i++) {
        const result = response.data.results[i];
        concatenatedDefinitions += `Definition ${i+1}:\n`;
        concatenatedDefinitions += `-: ${result.definition}\n`;
        concatenatedDefinitions += `Part of Speech: ${result.partOfSpeech}\n`;

        if (result.examples) {
          for(const tx of result.examples) {
            concatenatedDefinitions += `Examples: ${tx}\n`;
          }    
        }
        concatenatedDefinitions += '\n';
      }

      console.log(concatenatedDefinitions);
      res.json(concatenatedDefinitions);

    } catch (error) {
      console.error(error);
    }
});

const port = env.PORT;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});