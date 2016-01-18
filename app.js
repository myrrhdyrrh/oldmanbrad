var Client = require('node-rest-client').Client;
var Twit = require('twit');
var restclient = new Client();
var request = require('request');
var events = require('events');
var eventEmitter = new events.EventEmitter();

// insert your twitter app info here
var T = new Twit({
  consumer_key:         'Yo11uZyFcIdvOjBP0BRi2Pj6d', 
  consumer_secret:      'SoEBXkqxLYlFBSxnhfoFWt9IUWnZGXbXAAqrmIJaceVkGqhJ3H',
  access_token:         '4770359293-m6ss749C8It8HwVC0BSxPPkWYkAr9A2eJ2ezvQl',
  access_token_secret:  'A7kItqdTfSCgPGvvzW6j8GMJVWSOevHuLJ8PK2RLxPS9t'
});

var mashapeKey = 'MoEi2MpVdsmsh0VUOSsIh4Q8Qr54p1ipv3EjsnQoup4f576Aef';
var wordsApiArgs = { 
  headers: {
    "Accept" : "application/json",
     "X-Mashape-Key": mashapeKey
  }
}
var bandname = "";
var bandurl = "";
var ignoredWords = ["the", "of", "a"];

function generateWordsUrl(word) {
  var wordsBaseUrl = 'https://wordsapiv1.p.mashape.com/words/';
  return wordsBaseUrl + word +'/syllables';
}

function getWordSyllables(word, callback) {
  restclient.get(generateWordsUrl(word), wordsApiArgs, callback);
} 

function handleWordsApiResponse(data, response) {

  if(data) {
    console.log(data.syllables.list);
  }
}

function getRandomBand() {
  bandname = "";
  bandurl = "";
  var re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;
  var requestOpts = {uri: "http://www.metal-archives.com/band/random"};
  request(requestOpts, function(error, response, body) {
      var match = re.exec(body);
      if(match) {
        var name = match[0].split(" - Encyclopaedia Metallum: The Metal Archives")[0].split("<title>")[1];
        bandname = name;
        bandurl = response.request.uri.href;
        eventEmitter.emit('bandchosen');
      }
    });
}

function getRandomIndex(array) {
  var randomChoice = Math.random();
  var highestIndex = array.length - 1;
  var out = Math.round(randomChoice * highestIndex);
  return out;
}

function bradifyBand(bandName) {
  console.log("Bradifying: " + bandName);
  var bandWords = bandName.split(" ");
  var word = "";
  while(word == "" || ignoredWords.indexOf(word.toLowerCase()) != -1) {
      var chosenIndex = getRandomIndex(bandWords);
      word = bandWords[chosenIndex];
  }
  getWordSyllables(word, function(data, response) {

    if(data && data.syllables && data.syllables.list) {
        var syllables = data.syllables.list;
        if(/^[A-Z]/.test(word) && syllables.length == 1) {
          syllables[getRandomIndex(syllables)] = "Sux";
        }
        else {
          syllables[getRandomIndex(syllables)] = "sux";
        }

        var newWord = syllables.join("");
        bandWords[chosenIndex] = newWord;
        var newName = bandWords.join(" ");
        var tweetText = newName +". " + bandurl;
        console.log(tweetText);
        tweet(tweetText);
    }
    else{
      getRandomBand();
    }
  });

}

function tweet(text) { 
  T.post('statuses/update', { status: text}, function(err, reply) {
    if(err) { 
      console.log("error: " + err);
    }
    if(reply) { 
      console.log("reply: " + JSON.stringify(reply));
    }
  });
}

function init() { 
  eventEmitter.on('bandchosen', function() { bradifyBand(bandname); });
}
init();
getRandomBand();

