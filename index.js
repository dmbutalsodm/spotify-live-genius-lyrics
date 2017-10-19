var SpotifyWebHelper = require('spotify-web-helper');
const request = require('request-promise');
const http = require('http');
const api = require('genius-api');
const secure = require('./secure');
const genius = new api(secure.key);
const jsdom   = require('jsdom');
const { JSDOM } = jsdom;

const helper = SpotifyWebHelper({port: 4380}); //If it breaks, try numbers between 4370 and 4380.

let website;

function getFromGenius(query) {
    process.stdout.write('\n'.repeat(100));
    genius.search(query).then((response) => {
        let songObject = response.hits[0].result.full_title.includes("New Music Friday") ? response.hits[2].result : response.hits[0].result;
        website = `https://genius.com${songObject.path}`;
    }).then(() => makeRequest(website)).catch(reason => console.log(reason));
}

function makeRequest(website) {
    request({uri: website}, (e,r,b) => {
        return console.log(new JSDOM(b).window.document.querySelector("p").textContent);
    });
}

helper.player.on('error', err => console.log(err));

helper.player.on('ready', () => {
    helper.player.on('track-will-change', track => {
        return track.artist_resource ? getFromGenius(`${track.artist_resource.name} ${track.track_resource.name}`) : console.log("I couldn't find the song");
    });
});


