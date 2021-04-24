import { Readability } from "readability/Readability.js";
const CORS_PROXY = "https://spekticors.herokuapp.com/";
let Reader = async function(url) {
  let doc = await fetch(CORS_PROXY+url);
  doc = await doc.text();
  doc = new DOMParser().parseFromString(doc, "text/html");
  doc.originURI = url;
  return new Readability(doc).parse();
}
export { Reader };
