<template>
  <transition name="fade">
    <div v-if="this.component">
      <aside class="modal d-block" tabindex="-1" v-on:click="hide">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" id="dialog">
          <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">{{ title }}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" v-on:click="close">
                  <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <component v-bind:is="currentComponent" v-bind:details="details"></component>
          </div>
        </div>
      </aside>
      <div class="modal-backdrop"></div>
    </div>
  </transition>
</template>
<script>
import sources from "@/components/sources.vue";
import tags from "@/components/tags.vue";
import tagsAbout from "@/components/tagsabout.vue";
import notesAbout from "@/components/notesabout.vue";
export default {
  computed: {
    title() {
      if (this.component == "tags-about") {
        return "tags about this article"
      } else if (this.component == "notes-about") {
        return "notes about this article"
      }
      return this.component;
    },
    currentComponent() {
      if (["sources","tags","tags-about","notes-about"].indexOf(this.component) >= 0) {
        return this.component+"-view"        
      }
      return false;
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
  props: ["component", "details"],
};
</script>
