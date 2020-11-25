// The Integrator TTS & Cross-Platform
const Discord = require('discord.js'),
    tmi = require('tmi.js'),
    express = require("express"),
    fs = require("fs");

// Set up the basic config
const app = express();
let TTSMessages = [];
const {prefix, token, ttv_channel, discord_chat_channel, username, oauth, ttsid} = require("./config.json")

// Create Clients
const client = new Discord.Client();
const twitch = new tmi.client({options:{debug:true},connection:{cluster:'aws',reconnect:true},identity:{username:username,password:oauth},channels:[ttv_channel]});

/* Connection */
twitch.connect();
client.login(token);

twitch.on('connected', (add, port) => {
    twitch.action(ttv_channel, 'The Integrator Is Ready To Smash Kappa')
});

client.on('ready', () => {
    client.channels.fetch(discord_chat_channel).then(chnl=> {
        chnl.send("TheIntegrator Is Online :D")
    });
});


/* Twitch to Discord Chat */
twitch.on("chat", (channel, user, message, self) => {
    //Create embed for the message
    let chatembed = new Discord.MessageEmbed()
        .setColor("#6441A4")
        .setTitle(user['display-name'])
        .setDescription(message)
        .setTimestamp();
    client.channels.fetch(discord_chat_channel).then(chnl=>chnl.send(chatembed));
    //Check if customer redeemed reward
    if(user['custom-reward-id']){console.log("REWARD ID:"+user['custom-reward-id']);checkReward(user, message)};
});

/* Discord to Twitch Chat */
client.on('message', async (message) => {
    if(message.embeds.length < 1 && message.channel.id == discord_chat_channel && message.author.username != "TheIntegrator")
    {
        twitch.action(ttv_channel, message.author.username + ": " + message.content);
    }
});

/* Set up Local Server Message Event Stream */
app.get("/events", async function(req, res) {
    const SSE_RESPONSE_HEADER = {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no'
    };
    res.set(SSE_RESPONSE_HEADER);
    console.log("BrowserSource Listening");
    res.flushHeaders()
    while(true) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        res.write(`data: `+JSON.stringify(TTSMessages)+`\n\n`);
    }
})

/* Set up the default file and open start the webserver */
const index = fs.readFileSync('./index.html', 'utf8');
app.get('/', (req, res) => res.send(index));

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});

/* Rewards Processing */
function checkReward(u, msg) {
    switch(u['custom-reward-id'])
    {
        case ttsid:
            TTSMessages.push({id:TTSMessages.length,username:u['display-name'],msg:msg});
            twitch.action(ttv_channel, "TTS Message Added");
            break;
        default:
            console.log("No Reward");
            break;
    }
}