const GIST_DESC = "SpektiGist";
let Notes = class {
  constructor(gist) {
    /* this gist is a stringified JSON file */
    this.gist = gist;
    this.isReady = {};
    this.ready = new Promise((resolve,reject) => { this.isReady = resolve; });
    this.content = [];
    this.initNotes();
  }
  async makeNote(content,url=false) {
    console.info("adding note");
    let article = this.content.find(e => e.url == url);
    let id = this.nextId;
    this.content.push(
      {
        content,
        url,
        id,
        timestamp: (new Date()).toValue(),
      }
    );
    await this.commitChanges();
    return id;
  }
  async editNote(noteId,content) {
    console.info("editing note #"+noteId);
    let toEdit = this.content.find(e => e.id == noteId)
    if (typeof toEdit === "undefined") {
      console.warn("cannot edit note #"+noteId);
    } else {
      toEdit.content = content;
      toEdit.timestamp = (new Date()).toValue();
      await this.commitChanges();
    }
  }
  async deleteNote(noteId) {
    console.info("removing note #"+noteId);
    this.content = this.content.filter(e => e.id !== noteId);
    await this.commitChanges();
  }
  get allNotes() {
    return this.content;
  }
  get notesAbout(url) {
    return this.content.filter(e => e.url == url);
  }
  get nextId() {
    let id = 0;
    this.content.map(e => {
      if (e.id > id) {
        id = e.id;
      }
    });
    return id+1;
  }
  async initNotes() {
    this.gist = await this.gist.useGist({description:GIST_DESC});
    if (typeof this.gist === "undefined") {
      console.error("Gist "+GIST_DESC+" not found !");
    } else {
      try {
        let notes = await this.gist.getContent("notes");
        console.info("retrieved notes from gist");
        this.content = JSON.parse(notes);
      } catch {
        console.warn("notes file not found... creating...");
        await this.commitChanges();
      }
      this.isReady();
    }
  }
  async commitChanges() {
    await this.gist.putContent("notes",JSON.stringify(this.content));
  }
}
export { Notes };
