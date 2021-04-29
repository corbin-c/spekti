<template>
  <a :href="to" :title="title" v-on:click="navigate"><slot></slot></a>
</template>
<script>
export default {
  methods: {
    navigate(e) {
      e.preventDefault();
      if (this.statekey && this.payload) {
        this.$store.commit("fill", { key: this.statekey, content: this.payload });
      }
      if (this.event) {
        this.$root.$emit(this.event);
      }
      this.$router.push({ path: this.to });
    }
  },
  props: ["to","title","statekey","payload","event"]
}
</script>
