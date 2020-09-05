const GIST_DESC = "SpektiGist";

let SpektiEntity = class {
  constructor(gist,file) {
    this.gist = gist;
    this.file = file;
    this.content = [];
    this.isReady = {};
    this.ready = new Promise((resolve,reject) => { this.isReady = resolve; });
    this.getContent();
  }
  async getContent() {
    try {
      let content = await this.gist.getContent(this.file);
      console.info("retrieved "+this.file+" from gist");
      this.content = JSON.parse(content);
    } catch {
      console.warn("file "+this.file+" not found in gist, will create...");
    }
    this.isReady();
  }
  async commitChanges() {
    await this.gist.putContent(this.file,JSON.stringify(this.content));
  }
  get allContent() {
    return new Promise(async (resolve,reject) => {
      await this.ready;
      resolve(this.content);
    });
  }
}

let Tags = class extends SpektiEntity {
  async tagsAbout(url) {
    let article = (await this.allContent).find(e => e.url == url);
    return article;
  }
  async tagArticle(url,title,...tag) {
    console.info("adding tags "+tag.join(", ")+" to url "+url);
    let article = (await this.allContent).find(e => e.url == url);
    if (typeof article === "undefined") {
      this.content.push({url,title,tags:[...tag]});
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
    let article = (await this.allContent).find(e => e.url == url);
    if (typeof article === "undefined") {
      console.warn("article "+url+" not found, tag deletion aborted");
    } else {
      article.tags = article.tags.filter(e => !tag.some(f => f==e));
      if (article.tags.length == 0) {
        this.content = this.content.filter(e => e.url != url);
      }
      await this.commitChanges();
    }
  }
  get allTags() {
    return new Promise(async (resolve,reject) => {
      let all = ["fav","reviewed"];
      let content = await this.allContent;
      content.map(article => {
        article.tags.map(tag => {
          if (!all.some(e => e==tag)) {
            all.push(tag);
          }
        });
      });
      resolve(all);
    });
  }
}

let Notes = class extends SpektiEntity {
  async makeNote(content,url=false) {
    console.info("adding note");
    let id = await this.nextId();
    this.content.push(
      {
        content,
        url,
        id,
        timestamp: (new Date()).valueOf(),
      }
    );
    await this.commitChanges();
  }
  async editNote(noteId,content) {
    console.info("editing note #"+noteId);
    let toEdit = (await this.allContent).find(e => e.id == noteId)
    if (typeof toEdit === "undefined") {
      console.warn("cannot edit note #"+noteId);
    } else {
      toEdit.content = content;
      toEdit.timestamp = (new Date()).valueOf();
      await this.commitChanges();
    }
  }
  async deleteNote(noteId) {
    console.info("removing note #"+noteId);
    this.content = (await this.allContent).filter(e => e.id !== noteId);
    await this.commitChanges();
  }
  async nextId() {
    let id = 0;
    (await this.allContent).map(e => {
      if (e.id > id) {
        id = e.id;
      }
    });
    return id+1;
  }
  async notesAbout(url) {
    return (await this.allContent).filter(e => e.url == url);
  }
}

let Sources = class extends SpektiEntity {
  async addSource(url) {
    console.info("adding source "+url);
    let source = (await this.allContent).find(e => e == url);
    if (typeof source === "undefined") {
      this.content.push(url);
      await this.commitChanges();
    }
  }
  async removeSource(url) {
    console.info("removing source "+url);
    let source = (await this.allContent).find(e => e == url);
    if (typeof source === "undefined") {
      console.warn("source "+url+" not found, deletion aborted");
    } else {
      this.content = (await this.allContent).filter(e => e != url);
      await this.commitChanges();
    }
  }
}

const ENTITIES = { Tags, Notes, Sources };

let Spekti = class {
  constructor(gist,entities) {
    this.gist = gist;
    this.entities = entities;
    this.isReady = {};
    this.ready = new Promise((resolve,reject) => { this.isReady = resolve; });
    this.init();
  }
  async init() {
    let gist_list = await this.gist.listGists();
    if (gist_list.filter((e) => (e.description == GIST_DESC)).length == 0) {
      // No SpektiGist has been found, we shall create one
      let gist_id = await this.gist.createGist(
        this.entities[0].filename,"[]",GIST_DESC);
      this.gist = await this.gist.useGist({id:gist_id});
    } else {
      this.gist = await this.gist.useGist({description:GIST_DESC});
    }
    console.info("connected to "+GIST_DESC+" gist");
    this.entities.map(e => {
      this[e.filename] = new ENTITIES[e.type](this.gist,e.filename);
    })
    this.isReady();
  }
}

export { Spekti };
