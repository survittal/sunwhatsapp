const { Client, LocalAuth, MessageMedia, List, Buttons } = require('whatsapp-web.js');
var qrcode = require('qrcode-terminal');
var fs = require('fs');
const emoji = require('node-emoji');

const myGroupName = "My Wife";

const express = require('express');
const { exit } = require('process');
const app = express()
const port = 3000

var qrR = "No"
var sessionStarted = 0
var isReady = 0

// Load the session data if it has been previously saved

const clientNew = {}

const createWhatsAppSession = (id) => {

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: id,
    }),  
});
 
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    qrR=qr;
    console.log('QR RECEIVED');
});

client.on('ready', () => {
    
  isReady=1;
  console.log('Client is ready!');
  clientNew[id] = client;  

});

client.on('message', async message => {
  
  let chat = await message.getChat();

  console.log(chat.isGroup);

	if(message.body.includes('Hello') || message.body.includes('Hai')) {
		client.sendMessage(message.from, 'Nice...Hai How are you ?'+ emoji.emojify(':smile:'));
	}

  if(message.body.includes('Fine')){
    message.react(emoji.emojify(':heart:'));    
  }
    console.log(message.body);
});


client.initialize();

};

app.get('/send-whatsapp-notification', (req, res) => {
  
  try
  {

  if(isReady===1)
  {
    var id = req.query.id
    const client = clientNew[id]
    //const Media = MessageMedia.fromFilePath('D:/11.jpeg')
    //client.sendMessage('919844682156@c.us', Media,{caption:'Testing... '})
    client.sendMessage('919844682156@c.us', 'Hai How are you ? '+ emoji.emojify(':pizza:'))
    //client.sendMessage('919844682156@c.us', new Buttons('Body text/ MessageMedia instance', [{id:'customId',body:'button1'},{body:'button2'},{body:'button3'},{body:'button4'}], 'Title here, doesn\'t work with media', 'Footer here'), {caption: 'if you used a MessageMedia instance, use the caption here'});
    res.send('Message Sent')
    
  }
  else
  {    
      res.send(JSON.stringify({result:'Authentication not done'}));
  }
}
catch(error){
  res.send(JSON.stringify({result:'Invalid Client ID'}));
  console.error(error);
}

})

app.get('/startSession',(req,res) => {

try{
  if(sessionStarted === 0)
  {
    var id=req.query.id
    if(id!=null){
    createWhatsAppSession(id)
    console.log('Connecting to WhatsApp Server...')
    sessionStarted=1}
    else{
      res.send(JSON.stringify({result:'Invalid Client ID'}))
      return
    }
  }

  if(qrR != 'No')
  {
    //res.send({message:qrR})
    res.send(JSON.stringify({result:qrR}));
  }
  else
  {
    if(isReady===0)
    {
      res.send(JSON.stringify({result:'Client is Connecting...'}))
    }
    else
    {
      res.send(JSON.stringify({result:'Client is Running'}))
    }
  }
}
  catch(error){
    res.send(JSON.stringify({result:'Invalid Client ID'}));
    console.error(error);
  }
})

app.listen(port, () => {
    console.log(`Server is Initializing on port ${port}`)
    //createWhatsAppSession("YOUR_CLIENT_ID1")
    console.log(sessionStarted)
})