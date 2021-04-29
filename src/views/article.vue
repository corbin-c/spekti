<template>
  <article class="mt-3 mb-5">
    <div class="card mb-3">
      <div class="card-header row no-gutters align-items-center">
        <img
          class="col-md-2 rounded"
          v-if="content.img"
          :src="content.img"
          :alt="content.title">
        <h3 class="card-title col-md-10 pl-4 my-auto">{{ content.title }}</h3>
      </div>
      <tag-bar :url="content.link" :title="content.title"></tag-bar>
      <div class="card-body">
        <p v-html="readerContent" :class="contentClasses"></p>
      </div>
      <button type="button" id="close" class="btn btn-info" data-dismiss="modal" aria-label="Close" v-on:click="goBack">
        <span aria-hidden="true">&times;</span>
      </button>
      <div class="card-footer">
        <p class="card-text">
          <small class="text-muted">
           {{ footer }}<a :href="content.link" :title="'Open article « '+content.title+' »'" target="_blank">Source</a>
          </small>
        </p>
      </div>
    </div>
  </article>
</template>
<script>
import { Reader } from "@/reader.js";
import tagBar from "@/components/tagbar.vue";

export default {
  data: function() {
    return {
      readerContent: ""
    }
  },
  components: {
    "tag-bar": tagBar
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    }
  },
  computed: {
    content() {
      return this.$store.state.currentArticle;
    },
    footer() {
      if ((this.date == "") && (this.content.author == "")) {
        return "";
      } else if (this.content.author == "") {
        return this.date;
      } else if (this.content.date == "") {
        return this.content.author+" – ";
      }
      return this.content.author+" – "+this.date;
    },
    date() {
      try {
        return this.content.date.toLocaleDateString()
          +" – "+ this.content.date.toLocaleTimeString()+" – ";
      } catch {
        return "";
      }
    },
    contentClasses() {
      return {
        "card-text": this.readerContent.length > 0,
        "spinner-grow": this.readerContent.length == 0,
        "my-3": this.readerContent.length == 0,
        "text-info": this.readerContent.length == 0
      }
    },
  },
  async mounted() {
    if (typeof this.content.link === "undefined") {
      this.$router.push({ path: "/" });
      return;
    }
    let readerContent = (await Reader(this.content.link));
    if (!this.content.title) {
      this.content.title = readerContent.title;
    }
    if (!this.content.author) {
      this.content.author = (readerContent.byline == "")
        ? readerContent.siteName
        : readerContent.byline;
    }
    this.readerContent = readerContent.content;
  },
};
</script>
