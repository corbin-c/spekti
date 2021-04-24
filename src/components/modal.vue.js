import { sources } from "/spekti/sources.vue.js";
import { tags } from "/spekti/tags.vue.js";
import { tagsAbout } from "/spekti/tagsabout.vue.js";
import { notesAbout } from "/spekti/notesabout.vue.js";
let modal = {
  computed: {
    title() {
      if (this.content == "tags-about") {
        return "tags about this article"
      } else if (this.content == "notes-about") {
        return "notes about this article"
      }
      return this.content;
    },
    currentComponent() {
      if (["sources","tags","tags-about","notes-about"].indexOf(this.content) >= 0) {
        return this.content+"-view"        
      }
    }
  },
  components: {
    "sources-view": sources,
    "tags-view": tags,
    "tags-about-view": tagsAbout,
    "notes-about-view": notesAbout
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
  props: ["content", "update", "details"],
  template: `
  <transition name="fade">
    <div v-if="this.content">
      <aside class="modal d-block" tabindex="-1" v-on:click="hide">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" id="dialog">
          <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">{{ title }}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" v-on:click="close">
                  <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <component v-bind:is="currentComponent" v-bind:update="update" v-bind:details="details"></component>
          </div>
        </div>
      </aside>
      <div class="modal-backdrop"></div>
    </div>
  </transition>
  `
};
export { modal }
