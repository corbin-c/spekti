<template>
  <section v-bind:class="classes">
      <article v-if="noSources" class="card"><p class="card-body">No source has been found. You can start <a href="#" v-on:click="showSources" title="add some content">adding some RSS feeds</a> now !</p></article>
      <article-view v-if="singleArticle !== false" v-bind:content="singleArticle" v-bind:fullContent="(singleArticle !== false)"></article-view>
      <article-view v-else v-for="article in articles" :key="article.url" v-bind:content="article" v-bind:fullContent="(singleArticle !== false)"></article-view>
  </section>
</template>
<script>
import { Spekti } from "@/spekti.js";
import { Rss } from "@/rss.js";
import { DataGists } from "@corbin-c/datagists/DataGists.js";

import articleView from "./article.vue";

const maxItemsOnPage = 12;
      
export default {
  data: function() {
    return {
      maxItems: maxItemsOnPage,
      ready: false,
      noSources: false,
      singleArticle: false,
      allArticles: [],
      tags: []
    }
  },
  computed: {
    articles() {
      let reviewed = this.tags
        .filter(article => 
          article.tags.includes("reviewed"))
        .map(article => article.url);
      return this.allArticles
        .filter(article =>  !reviewed.includes(article.link))
        .sort((a,b) => b.date - a.date).slice(0,this.maxItems);
    },
    classes() {
      return {
        "spinner-grow": !this.ready,
        "text-info": !this.ready,
        "row": this.ready && !this.noSources && !this.singleArticle,
        "row-cols-1": this.ready && !this.noSources && !this.singleArticle,
        "row-cols-sm-2": this.ready && !this.noSources && !this.singleArticle,
        "row-cols-lg-3": this.ready && !this.noSources && !this.singleArticle,
        "row-cols-xl-4": this.ready && !this.noSources && !this.singleArticle,
        "mt-3": this.ready && !this.noSources,
        "mb-5": this.ready && !this.noSources,
        "text-center": this.ready && this.noSources,
        "p-5": this.ready && this.noSources,
        "m-3": this.ready && this.noSources
      }
    }
  },
  watch: {
    update: function () {
      this.loadContent();
    }
  },
  created() {
    this.$on("showFullArticle",this.showArticle);
    this.$root.$on("closeFullArticle",this.hideArticle);
  },
  components: {
    "article-view": articleView
  },
  methods: {
    scroll () {
      window.onscroll = () => {
        if ((this.singleArticle === false) && (this.ready)) {
          this.$root.scrollY = document.documentElement.scrollTop;
          let bottomOfWindow = Math.max(
            window.pageYOffset,
            document.documentElement.scrollTop,
            document.body.scrollTop)
            + window.innerHeight;
          if (bottomOfWindow 
            >= document.documentElement.offsetHeight-window.innerHeight*0.075) {
           this.maxItems += maxItemsOnPage;
          }
        }
      }
    },
    hideArticle() {
      this.singleArticle = false;
    },
    showArticle(article) {
      this.singleArticle = (this.singleArticle === article)
        ?false
        :article;
    },
    async loadContent () {
      await this.$root.spekti.ready;
      let rss = await this.$root.spekti.rss.allContent;
      this.tags = await this.$root.spekti.tags.allContent
      if (rss.length == 0) {
        this.noSources = true;
        this.allArticles = [];
      } else {
        this.noSources = false;
        let feed = [];
        rss.map(async (source) => {
          source = new Rss(source);
          await source.loadFeed();
          feed = [...feed,...source.feed];
          source.feed.map(feedItem => {
            if (!this.allArticles.includes(feedItem)) {
              this.allArticles.push(feedItem);
            }
            if (!this.ready) {
              this.ready = true;
            }
          });
          this.allArticles = this.allArticles
            .filter(article => (feed.includes(article)))
        });
      }
    },
    showSources() {
      this.$root.$emit("showModal","sources");
    }
  },
  mounted: function() {
    this.$nextTick(async function() {
      let gist = new DataGists(this.$root.logged);
      await gist.init();
      let entities = [
        { filename: "rss", type: "Sources" },
        { filename: "tags", type: "Tags" },
        { filename: "notes", type: "Notes" },
      ];
      this.$root.spekti = new Spekti(gist,entities);
      this.loadContent();
      this.scroll();
      try {
        await this.$root.spekti.ready;
        navigator.serviceWorker.controller.postMessage("FORCE SYNC");
      } catch {
        console.log("not ready yet")
      }
    });
  },
  props: ["update"],
};
</script>