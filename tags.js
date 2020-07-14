const GIST_DESC = "SpektiGist";
let Tags = class {
  constructor(gist) {
    /* this gist is a stringified JSON file */
    this.gist = gist;
    this.isReady = {};
    this.ready = new Promise((resolve,reject) => { this.isReady = resolve; });
    this.content = [];
    this.initTags();
  }
  async tagArticle(url,...tag) {
    console.info("adding tags "+tag.join(", ")+" to url "+url);
    let article = this.content.find(e => e.url == url);
    if (typeof article === "undefined") {
      this.content.push({url,tags:[...tag]});
    } else {
      tag.map(e => {
        if (!article.tags.some(f => f==e)) {
          article.tags.push(e); 
        }
      });
    }
    await this.commitChanges();
  }
  async untagArticle(url,...tag) {
    console.info("removing tags "+tag.join(", ")+" to url "+url);
    let article = this.content.find(e => e.url == url);
    if (typeof article === "undefined") {
      console.warn("article "+url+" not found, tag deletion aborted");
    } else {
      article.tags = article.tags.filter(e => !tag.some(f => f==e));
      await this.commitChanges();
    }
  }
  get allTags() {
    let all = ["fav","reviewed"];
    this.content.map(article => {
      article.tags.map(tag => {
        if (!all.some(e => e==tag)) {
          all.push(tag);
        }
      });
    });
    return all;
  }
  get taggedArticles() {
    return this.content;
  }
  async initTags() {
    this.gist = await this.gist.useGist({description:GIST_DESC});
    if (typeof this.gist === "undefined") {
      console.error("Gist "+GIST_DESC+" not found !");
    } else {
      try {
        let tags = await this.gist.getContent("tags");
        console.info("retrieved tags from gist");
        this.content = JSON.parse(tags);
      } catch {
        console.warn("tags file not found... creating...");
        await this.commitChanges();
      }
      this.isReady();
    }
  }
  async commitChanges() {
    await this.gist.putContent("tags",JSON.stringify(this.content));
  }
}
export { Tags };
