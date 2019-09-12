const GIST_DESC = "SpektiGist";
let Sources = class {
  constructor(gist) {
    this.gist = gist;
  }
  addSource(type,url) {
  }
  removeSource(url) {
  }
  async getSources() {
    let gist_list = await this.gist.listGists();
    if (gist_list.filter((e) => (e.description == GIST_DESC)).length == 0) {
      // No SpektiGist has been found, we shall create one
      this.gist = await this.gist.createGist(
        "rss_sources","no sources",GIST_DESC);
    } else {
      this.gist = await this.gist.useGist({description:GIST_DESC});
    }
  }
}
export { Sources };
