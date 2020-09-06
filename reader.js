import { Readability } from "https://corbin-c.github.io/readability/Readability.js";
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
let Reader = async function(url) {
  let doc = await fetch(CORS_PROXY+url);
  doc = await doc.text();
  doc = new DOMParser().parseFromString(doc, "text/html");
  doc.originURI = url;
  return new Readability(doc).parse();
}
export { Reader };
