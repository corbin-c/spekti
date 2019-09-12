const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const FEED_ELEMENTS = [
  {title:["title"]},
  {link:["link"]},
  {img:["enclosure"]},
  {abstract:["content:encoded","description"]},
  {date:["pubDate","dc:date"]},
  {author:["author","dc:creator"]}];
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
      element = (element.img == "") ? this.getImage(element):element;
      this.feed.push(element);
    }
  }
  getElement(item,selector) {
    try {
      let element = item.getElementsByTagName(selector)[0];
      if (selector == "enclosure") {
        element = element.getAttribute("url");
      } else if (selector.toLowerCase().indexOf("date") >= 0) {
        element = this.dateParser(element.textContent);
      } else if ((selector == "content:encoded")||(selector == "description")) {
        element = element.textContent;
        let div = document.createElement("textarea");
        div.innerHTML = decodeURIComponent(element);
        element = div.value;
        div.remove();
      } else {
        element = element.textContent;
      }
      return element;
    } catch {
      throw new Error("Element not found");
    }
  }
  getImage(feed_item) {
    try {
      let parsed_abstract = new DOMParser()
                            .parseFromString(feed_item.abstract, "text/html");
      let img = parsed_abstract.querySelector("img");
      feed_item.img = img.getAttribute("src");
      img.remove();
      feed_item.abstract = parsed_abstract
                            .documentElement.querySelector("body").innerHTML;
    } catch {
      console.warn("No image found");
    } finally {
      return feed_item;
    }
  }
  dateParser(dateString) {
    let dateOut = new Date(dateString);
    if (dateOut == "Invalid Date") {
      dateString = dateString.split(", ")[1];
      dateString = dateString.replace(/ \w+$/,"");
      dateOut = new Date(dateString);
    } // This would need improvements to take care of all date formats
    return dateOut;
  }
}
export { Rss };