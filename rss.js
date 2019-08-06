const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const FEED_ELEMENTS = [
  {title:["title"]},
  {link:["link","guid"]},
  {img:["enclosure"]},
  {abstract:["description","content:encoded"]},
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
      let element = {};
      for (let j of FEED_ELEMENTS) {
        element[Object.keys(j)[0]] = "";
        for (let k of j[Object.keys(j)[0]]) {
          try {
            element[Object.keys(j)[0]] = this.getElement(i,k);
            break;
          } catch {
            console.warn("Missing "+k+" element while building feed");
          }
        }
      }
      this.feed.push(element);
    }
  }
  this.getElement = function(item,selector) {
    return item.getElementsByTagName(selector)[0].innerHTML;
  }
}
export { Rss }