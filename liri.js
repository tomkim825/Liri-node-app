require("dotenv").config();
var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var request = require('request');
var keys = require('./keys.js');
var fs = require("fs");
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);
var command = process.argv[2];
var input = process.argv.splice(3).join(' ');
    if (input === undefined) {input=''};
// need this command to make it work on my machine. I get errors:
// [Error: UNABLE_TO_VERIFY_LEAF_SIGNATURE] 
// the following line should be commented out if you can run LIRI without it
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
//************************************************
// **     Above reserved for initializing app     **
//************************************************
//---------------------------------------------------------
// --      [start] 1st action for app -- clear console      --
//---------------------------------------------------------
// this command clears the console before displaying result [windows powershell users]
process.stdout.write('\033c');
// this command clears the console before displaying result [linux users... probably mac also. Does nothing on windows powershell]
console.log('\033[2J');
//--------------------------------------------------
// --         [end] 1st action - clear console       --
//--------------------------------------------------
//***************************************************************
// ** [start] needCommand():  if  command is not entered   **
//***************************************************************
function needCommand(){
    console.log('you entered: node liri.js ' );
    console.log('\nIt appears you tried running LIRI without adding any commands. Here is a list of commands available:');
    console.log(' --------------------------------------------------------------------------------------------------------------- ');
    console.log(' my-tweets : Display your last 20 tweets and when they were created');
    console.log(' movie-this "<movie name here>":  Pull up relevant info about that movie. Default is "Mr Nobody"');
    console.log(' spotify-this-song "<song name here>":  Pull up relevant info about that song.  Default is "The Sign"');
    console.log(' do-what-it-says: Perform action from random.txt');
    console.log(' --------------------------------------------------------------------------------------------------------------- ');
    console.log('\nWould you like to try again with a command?... for example: node liri.js my-tweets');
}
if (command === undefined) {needCommand()};
//****************************************************************
// **[end]  needCommand() + run function if condition met  **
//****************************************************************
//////////////////////////////////////////
//   [start] additionalCommand():   //
////////////////////////////////////////
function additionalCommand(){
    console.log('\nWould you like to run LIRI again with another command? [my-tweets, movie-this, spotify-this-song, do-what-it-says]');
};
//////////////////////////////////////////
//   [end]  additionalCommand():   //
////////////////////////////////////////
//-----------------------------
// --   [start] myTweets():   --
//-----------------------------
function myTweets(){
    var params = {screen_name: 'tomkim825'};
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
        console.log('20 recent tweets from @'+params.screen_name+': \n');
        for(var i=0; i<20; i++){
            console.log('('+tweets[i].created_at.slice(0,16)+') '+tweets[i].text);
        };
        additionalCommand();
    } else { console.log(error) }
});
}
//-----------------------------
// --   [end] myTweets():   --
//-----------------------------
//**********************************
// **   [start] spotifyThisSong():   **
//**********************************
function spotifyThisSong(input){
    if (input === ''){ 
        input = 'The Sign Ace of Base';
        console.log('Please enter a track name to search. Some good ones are "Snow - Hey Oh", "Busy Child", or "One Week".   \nFor now, I pulled up info on "The Sign" by Ace of Base:\n')
    };
    spotify.search({ type: 'track', query: input }, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err + "\nPlease try again with a different query term");
        }
        console.log("Here are the top 3 results: ")
        for( var i=0; i<3; i++){
            console.log('\n-------------------------------- Result ' + (i+1) + ' --------------------------------');
            console.log('Artist: ' + data.tracks.items[i].artists[0].name);
            console.log('Song Name: ' + data.tracks.items[i].name);
            console.log('Preview Link: ' +data.tracks.items[i].external_urls.spotify);
            console.log('Album Name: '+data.tracks.items[i].album.name);
        }
        console.log('\n--------------------------------------------------------------------------');
        additionalCommand();
      });
}
//**********************************
// **   [end] spotifyThisSong():   **
//**********************************
////////////////////////////////
//    [start] movieThis():    //
//////////////////////////////
function movieThis(input){
 
    if (input === ''){ 
        input = 'Mr. Nobody';
        console.log('Please enter a movie to search. Some good ones are "Inception", "Avengers", or "Star Wars".   \nFor now, I pulled up info on "Mr. Nobody":\n')
    };
    console.log(input);
    // API CALL -- Then run a request to the OMDB API with the movie specified
    var queryUrl = "http://www.omdbapi.com/?t=" + input + "&y=&plot=short&apikey=trilogy";
    request(queryUrl, function(error, response, body) {
        // If the request is successful
        if (!error && response.statusCode === 200) {
            // Parse the body of the site and recover just the imdbRating
            console.log("Title: " + JSON.parse(body).Title);
            console.log("Release Year: " + JSON.parse(body).Year);
            console.log("IMDB Rating: " + JSON.parse(body).imdbRating);
            console.log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value);
            console.log("Where Movie Was Produced (Country) : " + JSON.parse(body).Country);
            console.log("Language of Movie: " + JSON.parse(body).Language);
            console.log("Plot: " + JSON.parse(body).Plot);
            console.log("Acotrs: " + JSON.parse(body).Actors);
            additionalCommand();
        } else{ 
            console.log('Please try again using a different search term ')
        }
    });
    // End API call
};
///////////////////////////////
//    [end] movieThis():    //
/////////////////////////////
function runLiri(){
    // run appropriate function based on command
    // I considered using switch/case/break but in this situation, the following code was cleaner and compact
    if (command === 'my-tweets') { myTweets() }
    else if (command === 'spotify-this-song') { spotifyThisSong(input) }
    else if (command === 'movie-this') { movieThis(input) }
    else if (command === 'do-what-it-says') { doWhatItSays() }
    else { console.log("I'm sorry, I don't recognize that command. Could it be misspelt?"); additionalCommand()}
    }
    runLiri();

//---------------------------------
// --   [start] doWhatItSays():   --
//---------------------------------
function doWhatItSays(){
    fs.readFile("random.txt", "utf8", function(error, data) {
        if (error) {
            return console.log(error);
        } else{
            var dataArr = data.split(",");
            command = dataArr[0]; 
            input = dataArr[1];
            runLiri();        
            console.log(command);
        }
});
}
//---------------------------------
// --   [end] doWhatItSays():   --
//---------------------------------

