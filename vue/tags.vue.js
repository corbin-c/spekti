let tags = {
  data: function() {
    return {
      tags: [],
    }
  },
  watch: {
    update: function () {
    }
  },
  computed: {
    allTags() {
      return this.tags;
    },
  },
  methods: {
    async getTags() {
      await this.$root.spekti.ready;
      this.tags = await this.$root.spekti.tags.allTags;
    },
    showTag(tag) {
      this.$root.$emit("showTag",tag);
      this.$parent.close();
    }
  },
  mounted: function() {
    this.getTags();
  },
  props: ["update"],
  template: `
  <div class="modal-body d-flex justify-content-around flex-wrap align-content-around">
    <p v-if="allTags.length == 0">There is no tag yet. Start reviewing or tagging articles to see something here.</p>
    <button v-else class="btn btn-outline-secondary my-2" v-for="tag in allTags" v-on:click="showTag(tag)">{{tag}}</button>
  </div>
  `
};
export { tags }
