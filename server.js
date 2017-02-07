'use strict'

const express = require('express')
const Slapp = require('slapp')
const ConvoStore = require('slapp-convo-beepboop')
const Context = require('slapp-context-beepboop')

// use `PORT` env var on Beep Boop - default to 3000 locally
var port = process.env.PORT || 3000

var slapp = Slapp({
  // Beep Boop sets the SLACK_VERIFY_TOKEN env var
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  convo_store: ConvoStore(),
  context: Context()
})


var HELP_TEXT = `
I will respond to the following messages:
\`help\` - to see this message.
\`hi\` - to demonstrate a conversation that tracks state.
\`thanks\` - to demonstrate a simple response.
\`<type-any-other-text>\` - to demonstrate a random emoticon response, some of the time :wink:.
\`attachment\` - to see a Slack attachment message.
`

//*********************************************
// Setup different handlers for messages
//*********************************************

slapp.message('welcome', ['mention', 'direct_message'], (msg) => { 
  var welcomeLink = 'https://www.youtube.com/watch?v=-VsmF9m_Nt8'
  //  only 50% of the time
  if (Math.random() < 0.5) {
    welcomeLink = 'https://www.youtube.com/watch?v=lLuc6rtWkrM'
  }
  msg.say({
    text: 'Bonjour à tous! It\'se me, Chapeau!',
    attachments: [{
      text: 'I\'m not yet that intelligent. I need to pracitce my vocabulary!',
      title: 'Give me the words',
      title_link: welcomeLink,
      color: '#50E3C2'
    }]
  })
}) 





// response to the user typing "help"
slapp.message('help', ['mention', 'direct_message'], (msg) => {
  msg.say(HELP_TEXT)
})

slapp.message('download toolkit', ['mention', 'direct_message'], (msg) => {  
  msg.say({
    text: 'Here you can find the latest SRF Global-Design Toolkit for Sketch:\nSince this is your first download, make sure you have installed all necessary SRF fonts too. If not, simply type \'download fonts\'.',
    attachments: [{
      text: 'The SRG Toolkit contains all global design elements you need to start of with your design',
      title: 'SRF Global-Design Toolkit',
      image_url: 'http://mv7.ch/chapeau/srf-app-global-ui-elements.png',
      title_link: 'http://mv7.ch/chapeau/srf_global_design.sketch',
      color: '#50E3C2'
    }]
  })
}) 


slapp.message('download fonts', ['mention', 'direct_message'], (msg) => {  
  msg.say({
    text: 'Here you go! Just copy the font files into your system font library to make them available in sketch.',
    attachments: [{
      text: 'All SRF Web fonts including Serif and Non-Serif',
      title: 'SRF Web Fonts',
      image_url: 'http://mv7.ch/chapeau/srg-ssr-type.png',
      title_link: 'http://brandbox.srf.ch/download/attachments/3506918/SRG%20SSR%20Type_Web.zip?version=1&modificationDate=1481035992887&api=v2',
      color: '#50E3C2'
    }]
  })
})   
  

slapp.message('touch this', ['mention', 'direct_message'], (msg) => {  
  msg.say({
    text: 'Monsieur Chapeau is now able to give you buttons!',
    attachments: [{
      text: 'Don\'t touch this',
      title: 'Button example',
      fallback: 'Seems like you are not allowed to press buttons.',
      callback_id: 'nobuttons',
      color: '#50E3C2',
      attachment_type: 'default',
            'actions': [
                {
                    "name": "touch me",
                    "text": "Touch me",
                    "type": "button",
                    "value": "touch me"
                }
            ]
    }]
  })
})  

slapp.message('touch me', ['mention', 'direct_message'], (msg) => {  
    msg.say([':wave:', ':pray:', ':raised_hands:'])
})


// "Conversation" flow that tracks state - kicks off when user says hi, hello or hey
slapp
  .message('^(hi|hello|hey)$', ['direct_mention', 'direct_message'], (msg, text) => {
    msg
      .say(`${text} :spock-hand:, \nAs you already know, my name is Monsieur Chapeau. Try to pronounce chatbox with a sexy french accent, :kiss: there you go!\nBack to business, I offer you easy access to the design styleguide :art:. Type \`help\` to get keywords.`)
      // sends next event from user to this route, passing along state
      .route('how-are-you', { greeting: text })
  })
  .route('how-are-you', (msg, state) => {
    var text = (msg.body.event && msg.body.event.text) || ''

    // user may not have typed text as their next action, ask again and re-route
    if (!text) {
      return msg
        .say("Whoops, I'm still waiting to hear how you're doing.")
        .say('How are you?')
        .route('how-are-you', state)
    }

    // add their response to state
    state.status = text

    msg
      .say(`Ok then. What's your favorite color?`)
      .route('color', state)
  })
  .route('color', (msg, state) => {
    var text = (msg.body.event && msg.body.event.text) || ''

    // user may not have typed text as their next action, ask again and re-route
    if (!text) {
      return msg
        .say("I'm eagerly awaiting to hear your favorite color.")
        .route('color', state)
    }

    // add their response to state
    state.color = text

    msg
      .say('Thanks for sharing.')
      .say(`Here's what you've told me so far: \`\`\`${JSON.stringify(state)}\`\`\``)
    // At this point, since we don't route anywhere, the "conversation" is over
  })

// Can use a regex as well
slapp.message(/^(thanks|thank you)/i, ['mention', 'direct_message'], (msg) => {
  // You can provide a list of responses, and a random one will be chosen
  // You can also include slack emoji in your responses
  msg.say([
    "You're welcome :smile:",
    'You bet',
    ':+1: Of course',
    'Anytime :sun_with_face: :full_moon_with_face:'
  ])
})

// demonstrate returning an attachment...
slapp.message('attachment', ['mention', 'direct_message'], (msg) => {
  msg.say({
    text: 'Check out this amazing attachment! :confetti_ball: ',
    attachments: [{
      text: 'Slapp is a robust open source library that sits on top of the Slack APIs',
      title: 'Slapp Library - Open Source',
      image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
      title_link: 'https://beepboophq.com/',
      color: '#7CD197'
    }]
  })
})

// Catch-all for any other responses not handled above
slapp.message('.*', ['direct_mention', 'direct_message'], (msg) => {
  // respond only 40% of the time
  if (Math.random() < 0.4) {
    msg.say([':wave:', ':pray:', ':raised_hands:'])
  }
})

// attach Slapp to express server
var server = slapp.attachToExpress(express())

// start http server
server.listen(port, (err) => {
  if (err) {
    return console.error(err)
  }

  console.log(`Listening on port ${port}`)
})
