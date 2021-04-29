<template>
  <section class="mt-3 mb-5">
    <div class="card mb-3">
      <h3 class="card-header card-title">Notes</h3>
      <p class="card-body card-text" v-if="$store.state.notes.length == 0">There is no note yet. Write your first note now!</p>
      <ul class="list-group list-group-flush" v-else>
        <li v-for="note in $store.state.notes" :key="note.id" class="list-group-item d-flex justify-content-between align-items-center">
        <span class="w-75">{{ note.content }}</span>
        <span>{{ (new Date(note.timestamp)).toLocaleDateString() }}</span>
        <commit-link
          v-if="note.url"
          to="/article"
          :payload="{ link: note.url }"
          statekey="currentArticle"
          class="badge badge-pill badge-source"
          title="View article linked with this note">
          <svg class="d-inline">
            <use xlink:href="/octicons-sprite/octicons-sprite.svg#link-16"></use>
          </svg>
        </commit-link>
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
        <textarea ref="input" class="form-control" v-model="newNote" placeholder="New note"></textarea>
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
import commitLink from "@/components/commit-link.vue";

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
    "commit-link": commitLink
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
    hideArticle() {
      this.viewArticle = false;
    },
    submitNote() {
      if (this.edit === false) {
        this.addNote();
      } else {
        this.$store.dispatch("editNote", { content: this.newNote, id: this.edit });
        this.newNote = "";
        this.edit = false;
      }
    },
    addNote() {
      this.$store.dispatch("addNote", { content: this.newNote });
      this.newNote = "";
    },
    deleteNote(id) {
      this.edit = false;
      this.newNote = "";
      this.$store.dispatch("removeNote", id);
    },
    editNote(id,content) {
      this.$refs.input.focus();
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
