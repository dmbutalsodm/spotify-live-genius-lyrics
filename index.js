var SpotifyWebHelper = require('spotify-web-helper');
const request = require('request-promise');
const http = require('http');
const api = require('genius-api');
const secure = require('./secure');
const genius = new api(secure.key);
const jsdom   = require('jsdom');
const { JSDOM } = jsdom;

let helper = SpotifyWebHelper({port: 4380});

let website;
let exclusionArray = require('./exclusions.json');

helper.player.on('ready', () => {
    helper.player.on('track-will-change', track => {
        return track.artist_resource ? getFromGenius(`${track.artist_resource.name} ${track.track_resource.name}`) : console.log("I couldn't find the song.");
    });
});

function isInArray(string, array) {
    for(i = 0;i<array.length;i++) {
        if(string.toLowerCase().includes(array[i].toLowerCase())) return true;
    }
    return false;
}


function getFromGenius(query) {
    process.stdout.write('\n'.repeat(100));
    genius.search(query).then((response) => {
        let index = 0;
        if(!response.hits[index]) {
            website = null;
            return console.log("I couldn't find the song.");
        }
        while(isInArray(response.hits[index].result.full_title, exclusionArray)) {
            index += 1
        }
        songObject = response.hits[index].result;
        website = `https://genius.com${songObject.path}`;
    }).then(() => makeRequest(website)).catch(reason => console.log(reason));
}

function makeRequest(website) {
    if(website == null) return;
    request({uri: website}, (e,r,b) => {
        doc = new JSDOM(b).window.document
        console.log(`${doc.querySelector("h1").textContent} by ${doc.querySelector("h2").textContent.trim()}`);
        console.log("---");
        return console.log(doc.querySelector("p").textContent);
    });
}

helper.player.on('error', err => {
    if(err.message.match(/No user logged in/)) return process.exit(0);
});