<template>
  <div class="modal-scroll">
    <ul class="sources list-group list-group-flush">
      <li v-for="(source, index) in $store.state.rss" :key="source" class="list-group-item  d-flex justify-content-between align-items-center">
        <commit-link title="view only articles from this source" class="text-secondary text-decoration-none" :to="'/source/'+index" event="hideModal">{{ sourceReplace(source) }}</commit-link>
        <button class="badge badge-pill" title="Remove this source" v-on:click="removeSource(source)">
          <svg class="d-inline">
            <use xlink:href="/octicons-sprite/octicons-sprite.svg#trashcan-16"></use>
          </svg>
        </button>
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
</template>
<script>
import commitLink from "@/components/commit-link.vue";
export default {
  data: function() {
    return {
      sourceUrl: ""
    }
  },
  components: {
    "commit-link": commitLink
  },
  watch: {
  },
  computed: {
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
    sourceReplace(url) {
      return url.replace(/^http[s]*:\/\/(www.)*/,"")
    },
    testURL(url) {
      let r = /^(http|https):\/\/[^ "]+$/;
      return r.test(url);
    },
    addSource() {
      if (this.testURL(this.sourceUrl)) {
        this.$store.dispatch("addRSS",this.sourceUrl);
        this.sourceUrl = "";
      } else {
        alert("This URL doesn't look right, please try again");
      }
    },
    removeSource(url) {
      this.$store.dispatch("removeRSS",url);
    }
  },
  props: ["update"],
};
</script>
