<template>
  <section class="mt-3 mb-5">
    <article-view v-if="viewArticle !== false" v-bind:content="viewArticle" v-bind:fullContent="(viewArticle !== false)"></article-view>
    <div v-else class="card mb-3">
      <h3 class="card-header card-title">Articles tagged "{{ tag }}"</h3>
      <p class="card-body card-text"  v-if="taggedContent.length == 0">There is no content for this tag yet. Start reviewing or tagging articles to see something here.</p>
      <ul class="list-group list-group-flush" v-else>
        <li class="list-group-item d-flex justify-content-between align-items-center" v-for="article in taggedContent" :key="article.url" v-on:click="showArticle">
          {{ article.title }}
          <span class="d-none">{{ article.url }}</span>
          <span class="badge badge-info badge-pill" v-for="otherTag in otherTags(article)" :key="otherTag" v-on:click="changeTag(otherTag)">{{ otherTag }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
<script>
import articleView from "./article.vue";

export default {
  data: function() {
    return {
      allTags: [],
      viewArticle: false,
    }
  },
  watch: {
    update: function () {
      this.getTags();
    }
  },
  computed: {
    taggedContent() {
      return this.allTags.filter(article => article.tags.includes(this.tag))
    }
  },
  components: {
    "article-view": articleView
  },
  methods: {
    showArticle(event) {
      if (event.target.nodeName !== "SPAN") {
        let target = event.target.querySelector("span").innerText;
        target = this.taggedContent.find(e => e.url == target);
        this.viewArticle = {
          title: target.title,
          link: target.url,
          author: "",
          date: "",
          img: ""
        }
      }
    },
    otherTags(article) {
      return this.allTags
        .find(a => a.url == article.url).tags
        .filter(tag => tag != this.tag)
    },
    changeTag(tag) {
      this.$root.$emit("showTag",tag);
    },
    hideArticle() {
      this.viewArticle = false;
    },
    async getTags() {
      this.allTags = await this.$root.spekti.tags.allContent;
    }
  },
  created() {
    this.$root.$on("showTag",this.hideArticle);
    this.$on("hideArticle",this.hideArticle);
  },
  mounted() {
    this.getTags()
  },
  props: ["tag"],
};
</script>
