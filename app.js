var restclient = require('node-restclient');
var Twit = require('twit');
// var app = require('express').createServer();

// // I deployed to Nodejitsu, which requires an application to respond to HTTP requests
// // If you're running locally you don't need this, or express at all.
// app.get('/', function(req, res){
//     res.send('Hello world.');
// });
// app.listen(3000);

// insert your twitter app info here
var T = new Twit({
  consumer_key:         'Yo11uZyFcIdvOjBP0BRi2Pj6d', 
  consumer_secret:      'SoEBXkqxLYlFBSxnhfoFWt9IUWnZGXbXAAqrmIJaceVkGqhJ3H',
  access_token:         '4770359293-m6ss749C8It8HwVC0BSxPPkWYkAr9A2eJ2ezvQl',
  access_token_secret:  'A7kItqdTfSCgPGvvzW6j8GMJVWSOevHuLJ8PK2RLxPS9t'
});

function bradifyBand(bandName) { 
  var bradified = bandName + "sux";
  console.log(bradified);
  return bradified;
}

function tweet(text) { 
  T.post('statuses/update', { status: text}, function(err, reply) {
    if(err) { 
      console.log("error: " + err);
    }
    if(reply) { 
      console.log("reply: " + reply);
    }
  });
}
function favRTs () {
  T.get('statuses/retweets_of_me', {}, function (e,r) {
    for(var i=0;i<r.length;i++) {
      T.post('favorites/create/'+r[i].id_str,{},function(){});
    }
    console.log('harvested some RTs'); 
  });
}

tweet(bradifyBand("testing "));
// every 2 minutes, make and tweet a metaphor
// wrapped in a try/catch in case Twitter is unresponsive, don't really care about error
// handling. it just won't tweet.
// setInterval(function() {
//   try {
//     bradifyBand("testing ");
//     exit();
//   }
//  catch (e) {
//     console.log(e);
//   }
// }, 10000000);

