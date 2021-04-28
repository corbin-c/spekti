<template>
  <div id="app" class="container-fluid">
    <nav class="row navbar sticky-top navbar-expand navbar-light bg-light border-bottom border-info">
      <router-link to="/" class="text-decoration-none" title="Go back to articles list"><h2 class="text-info">{{ appName }}</h2></router-link>
      <ul class="navbar-nav ml-auto" v-if="$root.spekti !== false">
        <li class="nav-item">
          <a class="nav-link" title="Manage sources" v-on:click="setModal('sources')">Sources</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" title="Manage tags" v-on:click="setModal('tags')">Tags</a>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/notes" title="Manage notes">Notes</router-link>
        </li>
      </ul>
    </nav>
    <router-view />
    <app-modal v-bind:content="modal" v-bind:details="modalDetails" />
    <footer class="fixed-bottom text-right border-top border-info p-1 bg-light">
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
      modalDetails: false,
    }
  },
  mounted() {
    (async () => {
      let online = await fetch(((process.env.NODE_ENV === "production") ? "/spekti":"") + "/online");
      online = await online.text();
      console.log(online.includes("true"));
      if (online.includes("true")) {
        this.$store.dispatch("onlineAction", true);
      }
    })();
  },
  created() {
    if (this.serviceWorker) {
      this.registerWorker();
    }
    this.$root.$on("hideModal",this.hideModal);
  },
  components: {
    "app-modal": modal,
  },
  methods: {
    registerWorker() {
      if('serviceWorker' in navigator) {
        navigator.serviceWorker.register(((process.env.NODE_ENV === "production") ? "/spekti":"") + "/service-worker.js")
          .then(e => e.update());
        localStorage.setItem("synced",true);
        navigator.serviceWorker.onmessage = (e) => {
          let message = JSON.parse(e.data)
          let keys = localStorage.getItem("spekti-keys") || "[]";
          keys = JSON.parse(keys);
          if (message.method == "GET") {
            message.body = {};
            keys.map(e => {
              message.body[e] = localStorage.getItem(e);
            });
          } else if (message.method == "SYNC") {
            message.body = {};
            message.body.token = this.$root.logged;
            message.body.gistId = this.$root.spekti.gist.id;
          } else if (message.method == "CLEAR") {
            localStorage.setItem("synced","true");
          } else {
            if ((!message.init)
            || (localStorage.getItem("synced") === "true")) {
              if (!keys.includes(message.key)) {
                keys.push(message.key);
                localStorage.setItem("spekti-keys", JSON.stringify(keys));
              }
              localStorage.setItem(message.key, message.body);
              if (!message.init) {
                localStorage.setItem("synced","false");
              }
            }
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
    setModalDetails(target) {
      this.modalDetails = target;
    },
    hideModal() {
      this.setModal(false);
      this.setModalDetails(false);
    },
  }
};
</script>
