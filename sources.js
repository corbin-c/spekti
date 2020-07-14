const GIST_DESC = "SpektiGist";
const TYPES = ["rss","twitter"];
let Sources = class {
  constructor(gist) {
    this.gist = gist;
    this.types = [...TYPES];
    this.isReady = {};
    this.ready = new Promise((resolve,reject) => { this.isReady = resolve; });
    this.content = {};
    this.types.map(async type => {
      Object.defineProperty(this, type+"_sources", { get: function() {
        return new Promise(async (resolve,reject) => {
          await this.ready;
          console.info("getting "+type+" sources");
          resolve((await this.gist.getContent(type+"_sources")).split("\n")); 
        }); 
      }});
    });
    this.getSources();
  }
  async addSource(type,url) {
    await this.ready;
    let first = await this.gist.getContent(type+"_sources");
    if (first.indexOf(url) < 0) {
      first = (first !== "no sources");
      await this.gist.putContent(type+"_sources",url,first);
    }
  }
  async removeSource(type,url) {
    await this.ready;
    let sources = await this.gist.getContent(type+"_sources");
    sources = sources.split("\n").filter(e => e != url);
    sources = (sources.length == 0)?["no sources"]:sources;
    await this.gist.putContent(type+"_sources",sources.join("\n"));
  }
  async getSources() {
    let gist_list = await this.gist.listGists();
    if (gist_list.filter((e) => (e.description == GIST_DESC)).length == 0) {
      // No SpektiGist has been found, we shall create one
      let gist_id = await this.gist.createGist(
        this.types[0]+"_sources","no sources",GIST_DESC);
      this.gist = await this.gist.useGist({id:gist_id});
      await Promise.all(this.types.map(async (type) => {
        await this.gist.putContent(type+"_sources","no sources");
      }));
    } else {
      this.gist = await this.gist.useGist({description:GIST_DESC});
    }
    console.info("connected to sources gist");
    this.isReady();
  }
}
export { Sources };
