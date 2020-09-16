let sources = {
  data: function() {
    return {
      sources: [],
      sourceUrl: ""
    }
  },
  watch: {
    update: function () {
      this.getSources();
    }
  },
  computed: {
    allSources() {
      return this.sources;
    },
    inputClasses() {
      let classes = "form-control mx-auto";
      if ((this.sourceUrl !== "") && (!this.testURL(this.sourceUrl))) {
        classes += " is-invalid";
      }
      return classes;
    },
    disabled() {
      return !this.testURL(this.sourceUrl);
    }
  },
  methods: {
    async getSources() {
      await this.$root.spekti.ready;
      this.sources = await this.$root.spekti.rss.allContent;
    },
    testURL(url) {
      let r = /^(http|https):\/\/[^ "]+$/;
      return r.test(url);
    },
    async addSource() {
      if (this.testURL(this.sourceUrl)) {
        await this.$root.spekti.ready;
        await this.$root.spekti.rss.addSource(this.sourceUrl);
        this.sourceUrl = "";
        this.$root.$emit("update");
      } else {
        alert("This URL doesn't look right, please try again");
      }
    },
    async removeSource(url) {
      await this.$root.spekti.ready;
      await this.$root.spekti.rss.removeSource(url);
      this.$root.$emit("update");
    }
  },
  mounted: function() {
    this.getSources();
  },
  props: ["update"],
  template: `
  <div class="modal-scroll">
    <ul class="sources list-group list-group-flush">
      <li v-for="source in allSources" class="list-group-item  d-flex justify-content-between align-items-center">
        {{ source.replace(/^http[s]*:\\/\\/[www\\.]*/,"") }}
        <span class="badge badge-pill" v-on:click="removeSource(source)">
          <svg class="d-inline">
            <use xlink:href="/octicons-sprite/octicons-sprite.svg#trashcan-16"></use>
          </svg>
        </span>
      </li>
    </ul>
    <div class="modal-footer bg-light">
      <input type="text" v-model="sourceUrl" v-bind:class="inputClasses" placeholder="New source URL">
      <button type="button" class="btn btn-success" v-on:click="addSource" v-bind:disabled="disabled">
        <svg class="d-inline">
          <use xlink:href="/octicons-sprite/octicons-sprite.svg#check-circle-24"></use>
        </svg>
      </button>
    </div>
  </div>
  `
};
export { sources }
