<template>
  <main>
    <div class="text-center p-5 m-3" v-if="this.$root.logged === false">
      <p>In order to use Spekti, please login to your GitHub account and authorize the app.</p><p>Spekti only uses your GitHub account to store data as Gists.</p>
        <button class="btn btn-info mt-2" v-on:click="helloLogin">Login with GitHub
          <svg class="d-inline">
            <use xlink:href="/octicons-sprite/octicons-sprite.svg#mark-github-16" width="20" height="20"></use>
          </svg>
        </button>
      </div>
      <template v-else>
        <tag-view v-if="tag !== false" v-bind:tag="tag" v-bind:update="update"></tag-view>
        <notes-view v-else-if="notes !== false" v-bind:update="update"></notes-view>
        <main-view v-else v-bind:update="update"></main-view>      
      </template>
  </main>
</template>

<script>
import mainView from "./main.vue";
import tagView from "./tag.vue";
import notesView from "./notes.vue";
export default {
  mounted() {
    this.$nextTick(function() {
      console.log(this.$root.logged);
    });
  },
  methods: {
    helloLogin() {
      this.$root.$emit("hello-login",true);
    },
  },
  components: {
    "main-view": mainView,
    "tag-view": tagView,
    "notes-view": notesView
  },
  props: ["update","tag","notes"],
};
</script>
