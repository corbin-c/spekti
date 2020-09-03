import { sources } from "/spekti/vue/sources.vue.js";
import { tags } from "/spekti/vue/tags.vue.js";
let modal = {
  computed: {
    currentComponent() {
      if (["sources","tags","notes"].indexOf(this.content) >= 0) {
        return this.content+"-view"        
      }
    }
  },
  components: {
    "sources-view": sources,
    "tags-view": tags
  },
  methods: {
    hide(e) {
      if (e.target.nodeName === "ASIDE") {
          this.$root.$emit("hideModal","");
      }
    },
    close() {
      this.$root.$emit("hideModal","");
    }
  },
  props: ["content", "update"],
  template: `
  <transition name="fade">
    <div v-if="this.content">
      <aside class="modal d-block" tabindex="-1" v-on:click="hide">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" id="dialog">
          <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">{{ content }}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" v-on:click="close">
                  <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <component v-bind:is="currentComponent" v-bind:update="update"></component>
          </div>
        </div>
      </aside>
      <div class="modal-backdrop"></div>
    </div>
  </transition>
  `
};
export { modal }
