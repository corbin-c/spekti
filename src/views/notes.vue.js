import { articleView } from "./article.vue.js";

let notesView = {
  data: function() {
    return {
      newNote: "",
      notes: [],
      viewArticle: false,
      edit: false
    }
  },
  computed: {
    allNotes() {
      return this.notes;
    },
    disabled() {
      return (this.newNote.length == 0);
    },
  },
  components: {
    "article-view": articleView
  },
  methods: {
    showArticle(target) {
      this.viewArticle = {
        title: "",
        link: target,
        author: "",
        date: "",
        img: ""
      }
    },
    sourceClasses(url) {
      return {
        "badge-source":true,
        "badge": true,
        "badge-pill": true,
        "hidden": url === false
      }
    },
    hideArticle() {
      this.viewArticle = false;
    },
    async submitNote() {
      if (this.edit === false) {
        await this.addNote();
      } else {
        let content = this.newNote;
        this.newNote = "";
        await this.$root.spekti.ready;
        await this.$root.spekti.notes.editNote(this.edit,content);
        this.edit = false;
      }
    },
    async addNote() {
      let content = this.newNote;
      this.newNote = "";
      await this.$root.spekti.ready;
      await this.$root.spekti.notes.makeNote(content);
      this.newNote = "";
      this.getNotes();
    },
    async deleteNote(id) {
      await this.$root.spekti.ready;
      await this.$root.spekti.notes.deleteNote(id);
      this.getNotes();
    },
    async editNote(id,content) {
      this.edit = id;
      this.newNote = content;
    },
    async getNotes() {
      await this.$root.spekti.ready;
      this.notes = await this.$root.spekti.notes.allContent;
    },
  },
  created: function() {
    this.$root.$on("closeFullArticle",this.hideArticle);
    this.$on("hideArticle",this.hideArticle);
  },
  mounted: function() {
    this.getNotes();
  },
  props: ["update"],
  template: `
  <section class="mt-3 mb-5">
    <article-view v-if="viewArticle !== false" v-bind:content="viewArticle" v-bind:fullContent="(viewArticle !== false)"></article-view>
    <div class="card mb-3" v-else>
      <h3 class="card-header card-title">Notes</h3>
      <p class="card-body card-text" v-if="allNotes.length == 0">There is no note yet. Write your first note now!</p>
      <ul class="list-group list-group-flush" v-else>
        <li v-for="note in allNotes" class="list-group-item d-flex justify-content-between align-items-center">
        <span class="w-75">{{ note.content }}</span>
        <span>{{ (new Date(note.timestamp)).toLocaleDateString() }}</span>
        <span v-bind:class="sourceClasses(note.url)" v-on:click="showArticle(note.url)">
          <svg class="d-inline">
            <use xlink:href="/octicons-sprite/octicons-sprite.svg#link-16"></use>
          </svg>
        </span>
        <span class="badge-edit badge badge-pill" v-on:click="editNote(note.id,note.content)">
          <svg class="d-inline">
            <use xlink:href="/octicons-sprite/octicons-sprite.svg#pencil-16"></use>
          </svg>
        </span>
        <span class="badge-delete badge badge-pill" v-on:click="deleteNote(note.id)">
          <svg class="d-inline">
            <use xlink:href="/octicons-sprite/octicons-sprite.svg#trashcan-16"></use>
          </svg>
        </span>
        </li>
      </ul>
      <div class="card-footer bg-light d-flex justify-content-around align-items-center">
        <textarea class="form-control" v-model="newNote" placeholder="New note"></textarea>
        <button type="button" class="btn btn-success" v-on:click="submitNote" v-bind:disabled="disabled">
          <svg class="d-inline">
            <use xlink:href="/octicons-sprite/octicons-sprite.svg#check-circle-24"></use>
          </svg>
        </button>
      </div>
    </div>
  </section>
  `
};
export { notesView }
