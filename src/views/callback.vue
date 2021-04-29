<template>
  <section>
    <article class="card text-info mt-3">
      <p class="card-body" v-if="$store.login !== false">Yay! You're now connected to Github. You can close this window now.</p>
      <p class="card-body" v-if="$store.login === false && error" >Sorry, something wrong happened. You should go back & try again.</p>
      <p class="card-body" v-if="$store.login === false && !error">Connecting to Github... Please wait</p>
    </article>
  </section>
</template>
<script>
export default {
  data: function() {
    return {
      error: false,
    }
  },
  mounted: function() {
    this.$nextTick(async function() {
      this.grant();
    });
  },
  methods: {
    grant() {
      let search = (() => {
        let search = window.location.search.split("?")[1];
        if (typeof search === "undefined") {
          return false;
        }
        let obj = {};
        search.split("&").forEach(e => {
          e = e.split("=");
          obj[e[0]] = e[1];
        });
        return obj;
      })();
      console.log(search)
      let clientId = ((process.env.NODE_ENV === "production")
        ? "e039324ddce920ed3111"
        : "0cee4fa1d5515821c183");
      if (search !== false && Object.keys(search).length == 1) {
        (async () => {
          try {
            let auth = await fetch("https://spekticors.herokuapp.com/?code="+search.code+"&client_id="+clientId, { method: "POST" });
            auth = await auth.json();
            if (auth.access_token) {
              //trigger vuex store action
              this.$store.dispatch('loginAction', auth.access_token);
              window.opener.location.reload();
              window.close();
            } else {
              console.error(auth);
              throw new Error("Github identification failed");
            }
          } catch(e) {
            console.error(e);
            this.error = true;
          }
        })();
      } else {
        window.close();
        this.$router.push({ path:"/" });
      }
    }
  }
};
</script>
