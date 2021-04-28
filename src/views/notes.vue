<template>
  <section class="mt-3 mb-5">
    <article-view v-if="viewArticle !== false" v-bind:content="viewArticle" v-bind:fullContent="(viewArticle !== false)"></article-view>
    <div class="card mb-3" v-else>
      <h3 class="card-header card-title">Notes</h3>
      <p class="card-body card-text" v-if="$store.state.notes.length == 0">There is no note yet. Write your first note now!</p>
      <ul class="list-group list-group-flush" v-else>
        <li v-for="note in $store.state.notes" :key="note.id" class="list-group-item d-flex justify-content-between align-items-center">
        <span class="w-75">{{ note.content }}</span>
        <span>{{ (new Date(note.timestamp)).toLocaleDateString() }}</span>
        <router-link v-bind:class="sourceClasses(note.url)" :to="note.url" title="View article linked with this note">
          <svg class="d-inline">
            <use xlink:href="/octicons-sprite/octicons-sprite.svg#link-16"></use>
          </svg>
        </router-link>
        <button class="badge-edit badge badge-pill" v-on:click="editNote(note.id,note.content)" title="Edit this note">
          <svg class="d-inline">
            <use xlink:href="/octicons-sprite/octicons-sprite.svg#pencil-16"></use>
          </svg>
        </button>
        <button class="badge-delete badge badge-pill" v-on:click="deleteNote(note.id)" title="Delete this note">
          <svg class="d-inline">
            <use xlink:href="/octicons-sprite/octicons-sprite.svg#trashcan-16"></use>
          </svg>
        </button>
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
</template>

<script>
import articleView from "./article.vue";

export default {
  data: function() {
    return {
      newNote: "",
      viewArticle: false,
      edit: false
    }
  },
  computed: {
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
        this.$store.dispatch("editNote", { content: this.newNote, id: this.edit });
        this.newNote = "";
        this.edit = false;
      }
    },
    async addNote() {
      this.$store.dispatch("addNote", { content: this.newNote });
      this.newNote = "";
    },
    async deleteNote(id) {
      this.$store.dispatch("removeNote", id);
    },
    async editNote(id,content) {
      this.edit = id;
      this.newNote = content;
    },
  },
  created: function() {
    this.$root.$on("closeFullArticle",this.hideArticle);
    this.$on("hideArticle",this.hideArticle);
  },
  props: ["update"],
}
</script>
