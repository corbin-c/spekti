import { mainView } from "/spekti/vue/main.vue.js";
import { tagView } from "/spekti/vue/tag.vue.js";
let home = {
  methods: {
    helloLogin() {
      hello.login("github",{scope:"gist"});
    },
  },
  components: {
    "main-view": mainView,
    "tag-view": tagView
  },
  props: ["update","tag"],
  template: `
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
        <!--<notes-view v-if="notes !== false"></notes-view>-->
        <main-view v-else v-bind:update="update"></main-view>      
      </template>
  </main>`
};
export { home }
