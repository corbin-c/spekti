let tagsAbout = {
  data: function() {
    return {
      tags: [],
      tagsAbout: [],
      newTag: ""
    }
  },
  computed: {
    disabled() {
      return (this.newTag.length == 0)
    },
    allTags() {
      return this.tags.filter(tag => !["fav","reviewed"].includes(tag));
    },
    aboutTags() {
      return this.tagsAbout.filter(tag => !["fav","reviewed"].includes(tag));
    }
  },
  methods: {
    title(tag) {
      if (this.tagsAbout.includes(tag)) {
        return "Remove tag "+tag+" from this article";
      } else {
        return "Add tag "+tag+" from this article";        
      }
    },
    tagClasses(tag) {
      return {
        "btn": true,
        "my-2": true,
        "btn-outline-secondary": !this.tagsAbout.includes(tag),
        "btn-secondary": this.tagsAbout.includes(tag)
      }
    },
    async thisTags() {
      let tags = await this.$root.spekti.tags.tagsAbout(this.details.url);
      if (typeof tags !== "undefined") {
        this.tagsAbout = tags.tags;
      } else {
        this.tagsAbout = [];
      }
    },
    async getTags() {
      this.tags = await this.$root.spekti.tags.allTags;
    },
    async addTag(tag) {
      if (typeof tag !== "string") {
        tag = this.newTag;
        this.newTag = "";
      }
      await this.$root.spekti.tags.tagArticle(this.details.url,this.details.title,tag);
      this.getTags();
      this.thisTags();
    },
    async removeTag(tag) {
      await this.$root.spekti.tags.untagArticle(this.details.url,tag);
      this.getTags();
      this.thisTags();
    },
    toggle(tag) {
      if (this.tagsAbout.includes(tag)) {
        this.removeTag(tag);
      } else {
        this.addTag(tag);
      }
    }
  },
  mounted: function() {
    this.getTags();
    this.thisTags();
  },
  props: ["update","details"],
  template: `
  <div>
    <div class="modal-body d-flex justify-content-around flex-wrap align-content-around">
      <p v-if="allTags.length == 0">There is no tag yet. You can add a custom tag using the input below.</p>
      <button v-else v-bind:class="tagClasses(tag)" v-for="tag in allTags" v-on:click="toggle(tag)" v-bind:title="title(tag)">{{tag}}</button>
    </div>
    <div class="modal-footer bg-light">
      <input type="text" class="form-control mx-auto" v-model="newTag" placeholder="New tag">
      <button type="button" class="btn btn-success" v-on:click="addTag" v-bind:disabled="disabled">
        <svg class="d-inline">
          <use xlink:href="/octicons-sprite/octicons-sprite.svg#check-circle-24"></use>
        </svg>
      </button>
    </div>
  </div>
  `
};
export { tagsAbout }
