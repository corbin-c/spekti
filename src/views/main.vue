<template>
  <section :class="classes">
    <h2 style="max-width: 100%; width: 100%; flex: 1 0 auto;" class="mb-3 col-12 text-secondary d-flex justify-content-between align-items-center" v-if="source">
      Articles from {{ sourceReplace }} <router-link to="/" title="View articles from all sources" style="font-size: .5em;" class="small text-decoration-none text-info d-inline-block">All articles</router-link>
    </h2>
    <article v-if="noSources" class="card"><p class="card-body">No source has been found. You can start <a href="#" v-on:click="showSources" title="add some content">adding some RSS feeds</a> now !</p></article>
    <article-card v-else v-for="article in articles" :key="article.url" v-bind:content="article"></article-card>
    <div ref="scrollIndicator" style="max-width: 100%; width: 100%; flex: 1 0 auto; margin-top: 2rem; margin-bottom: 4rem;" class="d-flex justify-content-center">
    <button v-if="moreContent" v-on:click="loadMore" class="btn btn-outline-info">Load more content…</button>
    </div>
  </section>
</template>
<script>
import { Rss } from "@/rss.js";
import articleCard from "@/components/article-card.vue";

export default {
  data: function() {
    return {
      observer: null,
      lastRSS: []
    }
  },
  computed: {
    moreContent() {
      return (this.availableArticles.length > 0 && this.availableArticles.length > this.articles.length);
    },
    sourcesChanged() {
      if (this.lastRSS.length !== this.rss.length) {
        return true;
      }
      const sorted = [...this.rss].sort();
      for (let index in sorted) {
        if (this.lastRSS[index] !== sorted[index]) {
          return true;
        }
      }
      return false;
    },
    sourceReplace() {
      if (this.rss[this.source]) {
        return this.rss[this.source].replace(/^http[s]*:\/\/(www.)*/,"");
      }
      return "";
    },
    availableArticles() {
      let reviewed = this.$store.getters.taggedContent("reviewed")
        .map(article => article.url);
      return this.allArticles.filter(e => !reviewed.includes(e.link));
    },
    allArticles() {
      if (this.source) {
        return this.$store.state.articles.filter(e => e.source === this.rss[this.source]);
      }
      return this.$store.state.articles;
    },
    rss() {
      return this.$store.state.rss;
    },
    noSources() {
      return this.rss.length === 0;
    },
    articles() {
      let lastItem = this.$store.state.lastItem[(this.source || "*")] || 12;
      return [...this.availableArticles]
        .sort((a,b) => b.date - a.date)
        .slice(0,lastItem);
    },
    classes() {
      return {
        "row": !this.noSources,
        "row-cols-1": !this.noSources,
        "row-cols-sm-2": !this.noSources,
        "row-cols-lg-3": !this.noSources,
        "row-cols-xl-4": !this.noSources,
        "mt-3": !this.noSources,
        "mb-5": !this.noSources,
        "text-center": this.noSources,
        "p-5": this.noSources,
        "m-3": this.noSources
      }
    }
  },
  components: {
    "article-card": articleCard
  },
  mounted() {
    this.loadContent();
    this.$nextTick(function() {
      const options = {
        root: null,
        rootMargin: "0px",
        threshold: [0., 1.]
      };
      this.observer = new IntersectionObserver(this.handleIntersect, options);
      this.observer.observe(this.$refs.scrollIndicator);
    });
  },
  updated() {
    if (this.sourcesChanged) {
      this.loadContent();
    }
  },
  methods: {
    loadMore() {
      if (this.moreContent) {
        this.$store.commit("incrementLastItem", this.source);
      }
    },
    handleIntersect(event) {
      if (event[0].isIntersecting) {
        this.loadMore();
      }
    },
    async loadContent () {
      if (this.noSources) {
        return;
      }
      this.lastRSS = [...this.rss].sort();
      let feed = [];
      await Promise.all(this.rss.map(async (source) => {
        source = new Rss(source);
        await source.loadFeed();
        feed = [...feed, ...source.feed];
        if (this.$store.state.articles.length == 0) {
          //add the batch directly console.log("direct add"); 
          this.$store.commit("newFeed",feed);
        }
      }));
      this.$store.commit("newFeed",feed);
    },
    showSources(e) {
      e.preventDefault();
      this.$root.$emit("showModal", { component: "sources" });
    }
  },
  props: ["source"]
};
</script>
