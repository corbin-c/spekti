<template>
  <div id="app" class="container-fluid invisible">
    <nav class="row navbar sticky-top navbar-expand navbar-light bg-light border-bottom border-info">
      <h2 class="text-info" v-on:click="hideAll">{{ appName }}</h2>
      <ul class="navbar-nav ml-auto" v-if="$root.spekti !== false">
        <li class="nav-item">
          <a class="nav-link" title="Manage sources" v-on:click="setModal('sources')">Sources</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" title="Manage tags" v-on:click="setModal('tags')">Tags</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" title="Manage notes" v-on:click="showNotes">Notes</a>
        </li>
      </ul>
    </nav>
    <app-home v-bind:update="lastUpdate" v-bind:tag="tag" v-bind:notes="notes"></app-home>
    <app-modal
      v-bind:content="modal"
      v-bind:update="lastUpdate"
      v-bind:details="modalDetails">
    </app-modal>
    <footer class="fixed-bottom text-right border-top border-info p-1 bg-light">
      <small class="p-2">
        <a href="https://github.com/corbin-c/spekti" title="Spekti repository by corbin-c on Github">Contribute on Github</a>
      </small>
    </footer>
  </div>
</template>

<script>
import home from "./views/home.vue";
import * as hello from "hellojs/dist/hello.all.min.js";
import modal from "./components/modal.vue";
export default {
  name: 'App',
  data: function() {
    return {
      appName: "Spekti",
      currentRoute: window.location.pathname.slice(11),
      serviceWorker: true,
      modal: false,
      modalDetails: false,
      tag: false,
      notes: false,
      lastUpdate: (new Date()).valueOf()
    }
  },
  mounted() {
    (async () => {
      let online = await fetch(((process.env.NODE_ENV === "production") ? "/spekti":"") + "/online");
      online = await online.text();
      if (online == "false") {
        this.$root.logged = true;
      }
    })();
    hello.on("auth.login", (auth) => {
      this.$root.logged = auth.authResponse.access_token;
    });
    hello.init({github:((process.env.NODE_ENV === "production") ? "e039324ddce920ed3111" : "0cee4fa1d5515821c183")});
    document.querySelector(".spinner-grow").remove();
    document.querySelector("#app").classList.remove("invisible");
    history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', async (e) => {
      e.preventDefault();
      history.pushState(null,window.location.href,window.location.href);
      let scroll = this.$root.scrollY;
      this.hideAll();
      await (() => new Promise((resolve) => {
        setTimeout(resolve,100);
      }))();
      window.scrollTo(0,scroll)
    });
  },
  created() {
    if (this.serviceWorker) {
      this.registerWorker();
    }
    this.$root.$on("hideModal",this.hideModal);
    this.$root.$on("showModal",this.setModal);
    this.$root.$on("modalDetails",this.setModalDetails);
    this.$root.$on("update",this.updateView);
    this.$root.$on("showTag",this.showTag);
    this.$root.$on("hello-login",this.login);
  },
  components: {
    "app-home": home,
    "app-modal": modal,
  },
  methods: {
    login() {
      hello.login("github",{scope:"gist"});
    },
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
    showTag(target) {
      this.notes = false;
      this.tag = target;
    },
    showNotes() {
      this.hideArticle();
      this.tag = false;
      this.notes = true;
    },
    hideNotes() {
      this.notes = false;
    },
    updateView() {
      this.lastUpdate = (new Date()).valueOf();
    },
    hideModal() {
      this.setModal(false);
      this.setModalDetails(false);
    },
    hideArticle() {
      this.$emit("closeFullArticle","");
    },
    hideTags() {
      this.tag = false;
    },
    hideAll() {
      this.hideArticle();
      this.hideTags();
      this.hideNotes();
    }
  }
};
</script>
