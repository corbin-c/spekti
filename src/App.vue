<template>
  <div id="app" class="container-fluid">
    <nav class="row navbar sticky-top navbar-expand navbar-light bg-light border-bottom border-info">
      <router-link to="/" class="text-decoration-none" title="Go back to articles list"><h2 class="text-info">{{ appName }}</h2></router-link>
      <ul class="navbar-nav ml-auto" v-if="$store.state.connected !== false">
        <li class="nav-item">
          <a class="nav-link" title="Manage sources" v-on:click="setModal( { component: 'sources' })">Sources</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" title="Manage tags" v-on:click="setModal( { component: 'tags' })">Tags</a>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/notes" title="Manage notes">Notes</router-link>
        </li>
      </ul>
    </nav>
    <router-view />
    <app-modal v-bind:component="modal.component" v-bind:details="modal.details" />
    <footer class="fixed-bottom text-right border-top border-info bg-light d-flex justify-content-between">
      <small class="p-2">
        <a v-if="$store.state.connected" class="text-danger" title="Logout from Spekti" v-on:click="logout">
          Logout
        </a>
      </small>
      <small class="p-2">
        <a href="https://github.com/corbin-c/spekti" title="Spekti repository by corbin-c on Github">Contribute on Github</a>
      </small>
    </footer>
  </div>
</template>

<script>
import modal from "./components/modal.vue";

export default {
  name: 'App',
  data: function() {
    return {
      appName: "Spekti",
      serviceWorker: false,
      modal: false,
    }
  },
  mounted() {
    let path = window.location.search.split("?path")[1];
    if (typeof path !== "undefined") {
      path = decodeURIComponent("/"+path);
      this.$router.push({path});
    }
    this.isOnline();
    setInterval(() => {
      this.isOnline();
    },120000);
  },
  created() {
    if (this.serviceWorker) {
      this.registerWorker();
    }
    this.$root.$on("hideModal",this.hideModal);
    this.$root.$on("showModal",this.setModal);
  },
  components: {
    "app-modal": modal,
  },
  methods: {
    logout(e) {
      e.preventDefault();
      localStorage.clear();
      this.$store.commit("logoff");
    },
    isOnline() {
      (async () => {
        let online = await fetch(((process.env.NODE_ENV === "production") ? "/spekti":"") + "/online");
        online = await online.text();
        this.$store.dispatch("onlineAction", online.includes("true"));
      })();
    },
    registerWorker() {
      if("serviceWorker" in navigator) {
        navigator.serviceWorker.register(((process.env.NODE_ENV === "production") ? "/spekti":"") + "/service-worker.js")
          .then(e => e.update());
        navigator.serviceWorker.onmessage = (e) => {
          let message = JSON.parse(e.data)
          if (message.method == "GET") { //SW wants to retrieve data from LS
            message.body = {};
            ["rss", "notes", "tags", "login", "gist", "status"].forEach(e => {
              message.body[e] = localStorage.getItem(e) || "";
            });
          } else if (message.method == "SET") { //SW is setting data to LS
            localStorage.setItem(message.key, message.body);
          }
          navigator.serviceWorker.controller.postMessage(JSON.stringify(message));
        };
        navigator.serviceWorker.ready.then(swRegistration => {
          return swRegistration.sync.register('gistSync');
        });
      }
    },
    setModal(target) {
      this.modal = target;
    },
    hideModal() {
      this.setModal(false);
    },
  }
};
</script>
