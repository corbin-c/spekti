<template>
  <div class="card-header sticky-top tagbar d-flex justify-content-around">
    <button class="btn btn-outline-secondary" v-on:click="tag('fav')" :title="(isFav ? 'un':'')+'fav this article'">
      <svg class="d-inline" v-if="!isFav">
        <use xlink:href="/octicons-sprite/octicons-sprite.svg#bookmark-24"></use>
      </svg>
      <svg class="d-inline" v-else>
        <use xlink:href="/octicons-sprite/octicons-sprite.svg#bookmark-fill-24" class="regular"></use>
        <use xlink:href="/octicons-sprite/octicons-sprite.svg#bookmark-slash-fill-24" class="hover"></use>
      </svg>
    </button>
    <button class="btn btn-outline-secondary" v-on:click="tag('reviewed')" :title="'mark this article as '+(isReviewed ? 'un':'')+'seen'">
      <svg class="d-inline" v-if="isReviewed">
        <use xlink:href="/octicons-sprite/octicons-sprite.svg#eye-slash-24"></use>
      </svg>
      <svg class="d-inline" v-else>
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
</template>
<script>
export default {
  computed: {
    tags() {
      return this.$store.getters.tagsAbout(this.url).tags || [];
    },
    isFav() {
      return this.tags.includes("fav");
    },
    isReviewed() {
      return this.tags.includes("reviewed");
    }
  },
  methods: {
    showTags() {
      this.$root.$emit("showModal", { component: "tags-about", details: { url: this.url, title: this.title } });
    },
    showNotes() {
      this.$root.$emit("showModal", { component: "notes-about", details: { url: this.url } });
    },
    tag(tag) {
      this.$store.dispatch("tagArticle", { url: this.url, title: this.title, tag });
    },
  },
  props: ["url","title"],
};
</script>
