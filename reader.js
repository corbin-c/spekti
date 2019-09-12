import { Readability } from "./Readability.js";
/* import to be updated w/ forked version of https://github.com/mozilla/readability
 * with export { Readability }; and modified _fixRelativeUris func so it can
 * work w/ custom originURI property (l. 314~)
 */
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
let Reader = async function(url) {
  let doc = await fetch(CORS_PROXY+url);
  doc = await doc.text();
  doc = new DOMParser().parseFromString(doc, "text/html");
  doc.originURI = url;
  return new Readability(doc).parse();
}
export { Reader };