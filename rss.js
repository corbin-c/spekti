const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const FEED_ELEMENTS = [
  {title:["title"]},
  {link:["link","guid"]},
  {img:["enclosure","content:encoded/img"]},
  {date:["pubDate","dc:date"]},
  {author:["author","dc:creator"]}];

function Rss(url) {
  this.url = url;
  this.feed = [];
  this.loadFeed = async function() {
    let feed = await fetch(CORS_PROXY+this.url);
    feed = await feed.text();
    feed = (new DOMParser()).parseFromString(feed, "text/xml");
    this.parseFeed(feed);
  }
  this.parseFeed = function(feed) {
    let items = [...feed.querySelectorAll("item")];
    for (let i of items) {
      console.log(i); // do smthg here l8er
    }
  }
}