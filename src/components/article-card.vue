<template>
  <article class="col">
    <div class="card mb-3">
      <commit-link
        class="text-secondary text-decoration-none"
        to="/article/"
        statekey="currentArticle"
        :payload="content"
        :title="'Read this article: '+content.title">
          <img
            v-if="content.img.length > 0"
            v-bind:src="content.img"
            class="card-img-top"
            v-bind:alt="content.title">
          <h3 
            class="card-header card-title">
            {{ content.title }}
          </h3>
      </commit-link>
      <div class="card-body">
        <p class="card-text">{{ abstract }}</p>
      </div>
      <div class="card-footer">
        <p class="card-text">
          <small class="text-muted">
           {{ footer }}<a v-bind:href="content.link" v-bind:title="'Open article « '+content.title+' »'" target="_blank">Source</a>
          </small>
        </p>
      </div>
    </div>
  </article>
</template>
<script>
import commitLink from "@/components/commit-link.vue";

export default {
  components: {
    "commit-link": commitLink
  },
  computed: {
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
    abstract() {
      let abstract = this.content.abstract.split(" ");
      let output = [];
      for (let word of abstract) {
        output.push(word)
        if (output.join(" ").length > 300) {
          break;
        }
      }
      return output.join(" ")+" […]";
    }
  },
  props: ["content"]
};
</script>
