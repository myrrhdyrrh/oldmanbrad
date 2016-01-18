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
var ignoredWords = ["the", "of", "a", "or"];

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
    console.log("chosen word: " + word);
    if(data && data.syllables && data.syllables.list) {
        var syllables = data.syllables.list;
        var tweetText = replaceSyllables(syllables, word, chosenIndex, bandWords);
        console.log(tweetText);
        //tweet(tweetText);
    }
    else{
      var syllables = guessSyllables(word);
      var tweetText = replaceSyllables(syllables, word, chosenIndex, bandWords);
      console.log(tweetText);
      //tweet(tweetText);
    }
  });

}

function replaceSyllables(syllables, word, chosenIndex, bandWords) {
  var chosenSyllableIndex = getRandomIndex(syllables);
  if(/^[A-Z]/.test(word)) {
    var temp = syllables[0];
    syllables[0] = capitalizeFirstLetter(temp);
  }
  var chosenSyllable = syllables[chosenSyllableIndex];
  if(/^[A-Z]/.test(word) && (syllables.length == 1 ||  /^[A-Z]/.test(chosenSyllable))) {
    syllables[chosenSyllableIndex] = "Sux";
  }
  else {
    syllables[chosenSyllableIndex] = "sux";
  }

  var newWord = syllables.join("");
  bandWords[chosenIndex] = newWord;
  var newName = bandWords.join(" ");
  var tweetText = newName +". " + bandurl;
  return tweetText;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function guessSyllables(word) {
  word = word.toLowerCase();                                     
  if(word.length <= 3) { return 1; }                             
  var words = word.split(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/);
  var out = [];
  var out2 = [];
  for (var i = 0; i < words.length; i++) {
    var temp = words[i].split(/^y/);
    for(var j = 0; j< temp.length; j++) {
      out.push(temp[j]);
    }
  }
  for (var i = 0; i < out.length; i++) {
    var temp = out[i].split(/([aeiouy]{1,2})/g);
    for(var j = 0; j< temp.length; j++) {
      out2.push(temp[j]);
    }
  }
  var fixedOut = [];
  for (var i = 0; i < out2.length; i++) {
    var current = out2[i];
    if (current.search(/([aeiouy])/g) != -1) {
      if(fixedOut.length == 0) {
          fixedOut.push(current);
      }
      else {
        var last = fixedOut[fixedOut.length - 1];
        fixedOut[fixedOut.length - 1] = last + current;
      }
    }
    else{
      if(i == out2.length - 1) {
        var last = fixedOut[fixedOut.length - 1];
        fixedOut[fixedOut.length - 1] = last + current;
      }
      else{
      fixedOut.push(current);
      }
    }
  }
  return fixedOut;
}

function tweet(text) { 
  T.post('statuses/update', { status: text}, function(err, reply) {
    if(err) { 
      console.log("error: " + err);
    }
    if(reply) { 
      //console.log("reply: " + JSON.stringify(reply));
    }
  });
}

function init() { 
  eventEmitter.on('bandchosen', function() { bradifyBand(bandname); });
}
init();
getRandomBand();

