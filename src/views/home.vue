<template>
  <main>
    <router-view v-if="$store.state.login !== false"/>
    <div class="text-center p-5 m-3" v-else>
      <p>In order to use Spekti, please login to your GitHub account and authorize the app.</p>
      <p>Spekti only uses your GitHub account to store data as Gists.</p>
        <button class="btn btn-info mt-2" v-on:click="login">Login with GitHub
          <svg class="d-inline">
            <use xlink:href="/octicons-sprite/octicons-sprite.svg#mark-github-16" width="20" height="20"></use>
          </svg>
        </button>
    </div>
  </main>
</template>

<script>
export default {
  mounted() {
    let login = localStorage.getItem("login");
    if (login === "false" || typeof login === "undefined" || login === null) {
      return;
    }
    this.$store.dispatch('loginAction', login);
  },
  methods: {
    login() {
      const clientId = (process.env.NODE_ENV === "production")
        ? "e039324ddce920ed3111"
        : "0cee4fa1d5515821c183";
      const redirectUri = (process.env.NODE_ENV === "production")
        ? "https://corbin-c.github.io/spekti/callback"
        : "http://localhost:8080/callback";
      window.open("https://github.com/login/oauth/authorize?client_id="+clientId+"&redirect_uri="+redirectUri+"&scope=gist");
    },
  }
}
</script>
