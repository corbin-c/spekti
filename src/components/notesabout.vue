<template>
  <div>
    <div class="modal-body justify-content-around flex-wrap align-content-around">
      <p v-if="allNotes.length == 0">There is no note yet. You can add a note using the input below.</p>
      <ul class="list-group list-group-flush" v-else>
        <li v-for="note in allNotes" :key="note.id" class="list-group-item d-flex justify-content-between align-items-center">
        <span class="w-50">{{ note.content }}</span>
        <span>{{ (new Date(note.timestamp)).toLocaleDateString() }}</span>
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
    </div>
    <div class="modal-footer bg-light">
      <input type="text" ref="input" class="form-control mx-auto" v-model="newNote" placeholder="New note">
      <button type="button" class="btn btn-success" v-on:click="submitNote" v-bind:disabled="disabled">
        <svg class="d-inline">
          <use xlink:href="/octicons-sprite/octicons-sprite.svg#check-circle-24"></use>
        </svg>
      </button>
    </div>
  </div>
</template>
<script>
export default {
  data: function() {
    return {
      newNote: "",
      edit: false
    }
  },
  computed: {
    allNotes() {
      return this.$store.getters.notesAbout(this.details.url);
    },
    disabled() {
      return (this.newNote.length == 0);
    },
  },
  methods: {
    hideArticle() {
      this.viewArticle = false;
    },
    submitNote() {
      if (this.edit === false) {
        this.addNote();
      } else {
        this.$store.dispatch("editNote", { content: this.newNote, id: this.edit, url: this.details.url });
        this.newNote = "";
        this.edit = false;
      }
    },
    addNote() {
      this.$store.dispatch("addNote", { content: this.newNote, url: this.details.url });
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
  props: ["update","details"],
};
</script>
