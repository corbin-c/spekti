let tagBar = {
  data: function() {
    return {
      allTags: [],
    }
  },
  computed: {
    isFav() {
      return this.allTags.includes("fav");      
    },
    isReviewed() {
      return this.allTags.includes("reviewed");
    }
  },
  methods: {
    async getTags() {
      let tags = await this.$root.spekti.tags.tagsAbout(this.url);
      if (typeof tags !== "undefined") {
        this.allTags = tags.tags;        
      } else {
        this.allTags = [];
      }
    },
    showTags() {
      this.$root.$emit("showModal","tags-about");
      this.$root.$emit("modalDetails",{url: this.url, title: this.title});
    },
    showNotes() {
      this.$root.$emit("showModal","notes-about");
      this.$root.$emit("modalDetails",this.url);
    },
    async addTag(tag) {
      await this.$root.spekti.tags.tagArticle(this.url,this.title,tag);
      this.$root.$emit("update");
      this.getTags();
    },
    async removeTag(tag) {
      await this.$root.spekti.tags.untagArticle(this.url,tag);
      this.$root.$emit("update");
      this.getTags();
    }
  },
  mounted() {
    this.getTags();
  },
  props: ["url","title"],
  template: `
  <div class="card-header sticky-top tagbar d-flex justify-content-around">
    <button class="btn btn-outline-secondary" v-if="isFav" v-on:click="removeTag('fav')" title="unfav this article">
      <svg class="d-inline">
        <use xlink:href="/octicons-sprite/octicons-sprite.svg#bookmark-fill-24" class="regular"></use>
        <use xlink:href="/octicons-sprite/octicons-sprite.svg#bookmark-slash-fill-24" class="hover"></use>
      </svg>
    </button>
    <button class="btn btn-outline-secondary" v-else v-on:click="addTag('fav')" title="fav this article">
      <svg class="d-inline">
        <use xlink:href="/octicons-sprite/octicons-sprite.svg#bookmark-24"></use>
      </svg>
    </button>
    <button class="btn btn-outline-secondary" v-if="isReviewed" v-on:click="removeTag('reviewed')" title="mark this article as unseen">
      <svg class="d-inline">
        <use xlink:href="/octicons-sprite/octicons-sprite.svg#eye-slash-24"></use>
      </svg>
    </button>
    <button class="btn btn-outline-secondary" v-else v-on:click="addTag('reviewed')" title="mark this article as seen">
      <svg class="d-inline">
        <use xlink:href="/octicons-sprite/octicons-sprite.svg#eye-24"></use>
      </svg>
    </button>
    <button class="btn btn-outline-secondary" title="add a custom tag to this article" v-on:click="showTags">
      <svg class="d-inline">
        <use xlink:href="/octicons-sprite/octicons-sprite.svg#plus-24"></use>
      </svg>
    </button>
    <button class="btn btn-outline-secondary" title="add a note to this article" v-on:click="showNotes">
      <svg class="d-inline">
        <use xlink:href="/octicons-sprite/octicons-sprite.svg#pencil-24"></use>
      </svg>
    </button>
  </div>
`
};
export { tagBar }
