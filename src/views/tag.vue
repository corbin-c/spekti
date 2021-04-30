<template>
  <section class="mt-3 mb-5">
    <div class="card mb-3">
      <h3 class="card-header card-title">Articles tagged "{{ tag }}"</h3>
      <p class="card-body card-text"  v-if="$store.getters.taggedContent(tag).length == 0">There is no content for this tag yet. Start reviewing or tagging articles to see something here.</p>
      <ul class="list-group list-group-flush" v-else>
        <li class="list-group-item d-flex justify-content-between align-items-center" v-for="article in $store.getters.taggedContent(tag)" :key="article.url">
          <commit-link
            class="text-secondary text-decoration-none"
            to="/article/"
            statekey="currentArticle"
            :payload="{ link: article.url }"
            :title="'Read this article: '+article.title">
              {{ article.title }}
          </commit-link>
          <router-link
            class="badge badge-info badge-pill mx-1"
            v-for="otherTag in $store.getters.otherTags(article.url,tag)"
            :key="otherTag"
            :title="'View more articles with this tag: '+otherTag"
            :to="'/tag/'+otherTag">{{ otherTag }}</router-link>
          <button title="untag this article" class="badge-delete badge badge-pill" v-on:click="removeTag(article.url)">
            <svg class="d-inline">
              <use xlink:href="/octicons-sprite/octicons-sprite.svg#trashcan-16"></use>
            </svg>
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>
<script>
import commitLink from "@/components/commit-link.vue";
export default {
  mounted() {
    this.$root.$emit("hideModal");    
  },
  updated() {
    this.$root.$emit("hideModal");
  },
  methods: {
    removeTag(url) {
      this.$store.dispatch("tagArticle",{ url , tag: this.tag });
    }
  },
  components: {
    "commit-link": commitLink
  },
  props: ["tag"],
};
</script>
