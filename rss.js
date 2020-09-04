const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const FEED_ELEMENTS = [
  {title:["title"]},
  {link:["link"]},
  {img:["enclosure"]},
  {abstract:["content:encoded","description"]},
  {date:["pubDate","dc:date"]},
  {author:["author","dc:creator"]}];
const dateParser = (dateString) => {
  let dateOut = new Date(dateString);
  if (dateOut == "Invalid Date") {
    dateString = dateString.split(", ")[1];
    dateString = dateString.replace(/ \w+$/,"");
    dateOut = new Date(dateString);
  } // This would need improvements to take care of all date formats
  return dateOut;
}
const METHODS = {
  enclosure: e => {
    if ((e.getAttribute("type") !== null)
      && (e.getAttribute("type").indexOf("image") >= 0)) {
      return e.getAttribute("url");
    } else {
      return "";
    }
  },
  "content:encoded": e => {
    if (e.firstChild.nodeName == "#cdata-section") {
      e = e.firstChild.data;
      e = new DOMParser().parseFromString(e, "text/html").body.textContent
    } else {
      e = e.textContent;
      e = new DOMParser().parseFromString(e, "text/html").body.textContent
    }
    return e;
  },
  description: e => {
    e = e.textContent;
    e = new DOMParser().parseFromString(e, "text/html").body.textContent
    return e;
  },
  pubDate: e => dateParser(e.textContent),
  "dc:date": e => dateParser(e.textContent),
  other: e => e.textContent
}
let Rss = class {
  constructor(url) {
    this.url = url;
    this.feed = [];
  }
  async loadFeed() {
    let feed = await fetch(CORS_PROXY+this.url);
    feed = await feed.text();
    feed = new DOMParser().parseFromString(feed, "text/xml");
    this.parseFeed(feed);
  }
  parseFeed(feed) {
    let items = [...feed.querySelectorAll("item")];
    for (let i of items) {
      let element = {};
      FEED_ELEMENTS.map(j => {
        element[Object.keys(j)[0]] = "";
        for (let k of j[Object.keys(j)[0]]) {
          try {
            element[Object.keys(j)[0]] = this.getElement(i,k);
            break;
          } catch {
            console.warn("Missing element while building feed");
          }
        }
      });
      element.img = (element.img == "") ? this.getImage(i):element.img;
      this.feed.push(element);
    }
  }
  getElement(item,selector) {
    try {
      let element = item.getElementsByTagName(selector)[0];
      if (typeof METHODS[selector] === "undefined") {
        return METHODS.other(element);
      } else {
        return METHODS[selector](element);
      }
    } catch {
      throw new Error("Element not found");
    }
  }
  getImage(feed_item) {
    try {
      let img = feed_item.querySelector("img");
      return img.getAttribute("src");
    } catch(e) {
      try {
        let content = feed_item.getElementsByTagName("content:encoded")[0];
        if (content.firstChild.nodeName == "#cdata-section") {
          content = content.firstChild.data;
          content = new DOMParser()
            .parseFromString(content, "text/html");
          return this.getImage(content);
        }
      } catch {
        console.warn("No image found");
        return "";        
      }
    }
  }
}
export { Rss };
