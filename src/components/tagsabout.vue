<template>
  <div>
    <div class="modal-body d-flex justify-content-around flex-wrap align-content-around">
      <p v-if="allTags.length == 0">There is no tag yet. You can add a custom tag using the input below.</p>
      <button
        v-else
        v-for="tag in allTags"
        :class="tagClasses(tag)"
        :key="tag"
        v-on:click="toggle(tag)"
        :title="(tagsAbout.includes(tag) ? 'Remove':'Add')+' tag '+tag+' from this article'">
        {{tag}}</button>
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
</template>
<script>
export default {
  data: function() {
    return {
      newTag: ""
    }
  },
  computed: {
    tagsAbout() {
      return this.$store.getters.tagsAbout(this.details.url).tags || [];
    },
    disabled() {
      return (this.newTag.length == 0)
    },
    allTags() {
      return this.$store.getters.allTags.filter(tag => !["fav","reviewed"].includes(tag));
    },
    aboutTags() {
      return this.tagsAbout.filter(tag => !["fav","reviewed"].includes(tag));
    }
  },
  methods: {
    tagClasses(tag) {
      return {
        "btn": true,
        "my-2": true,
        "mx-1": true,
        "btn-outline-secondary": !this.tagsAbout.includes(tag),
        "btn-secondary": this.tagsAbout.includes(tag)
      }
    },
    addTag() {
      this.toggle(this.newTag);
      this.newTag = "";
    },
    toggle(tag) {
      this.$store.dispatch("tagArticle", { url: this.details.url, title: this.details.title, tag });
    }
  },
  props: ["update","details"],
};
</script>
