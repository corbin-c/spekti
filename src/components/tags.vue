<template>
  <div class="modal-body d-flex justify-content-around flex-wrap align-content-around">
    <p v-if="$store.getters.allTags.length == 0">There is no tag yet. Start reviewing or tagging articles to see something here.</p>
    <router-link v-else class="btn btn-outline-secondary my-2 mx-1" v-for="tag in $store.getters.allTags" :key="tag" :to="'/tag/' + tag">{{tag}}</router-link>
  </div>
</template>
<script>
export default {
};
</script>
