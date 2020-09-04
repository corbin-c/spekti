let notesAbout = {
  data: function() {
    return {
      newNote: "",
      notes: [],
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
  methods: {
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
      await this.$root.spekti.notes.makeNote(content,this.details);
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
      this.notes = await this.$root.spekti.notes.notesAbout(this.details);
    },
  },
  mounted: function() {
    this.getNotes();
  },
  props: ["update","details"],
  template: `
  <div>
    <div class="modal-body justify-content-around flex-wrap align-content-around">
      <p v-if="allNotes.length == 0">There is no note yet. You can add a note using the input below.</p>
      <ul class="list-group list-group-flush" v-else>
        <li v-for="note in allNotes" class="list-group-item d-flex justify-content-between align-items-center">
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
      <input type="text" class="form-control mx-auto" v-model="newNote" placeholder="New note">
      <button type="button" class="btn btn-success" v-on:click="submitNote" v-bind:disabled="disabled">
        <svg class="d-inline">
          <use xlink:href="/octicons-sprite/octicons-sprite.svg#check-circle-24"></use>
        </svg>
      </button>
    </div>
  </div>
  `
};
export { notesAbout }
