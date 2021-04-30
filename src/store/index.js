import Vue from "vue"
import Vuex from "vuex"
//~ import { Spekti } from "@/spekti.js";
import { DataGists } from "@corbin-c/datagists/DataGists.js";
const GIST_DESC = "SpektiGist";
let gist = false;
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    online: false,
    login: false,
    connected: false,
    tags: [],
    notes: [],
    rss: [],
    articles: [],
    lastItem: {},
    currentArticle: {}
  },
  mutations: {
    incrementLastItem(state, source) {
      if (typeof source === "undefined") {
        source = "*"
      }
      state.lastItem = {...state.lastItem, [source]:(state.lastItem[source] || 12)+12};
    },
    newFeed(state, feed) {
      feed = feed.filter(article => {
        return (!state.articles.some(e => e.link == article.link))
      });
      if (feed.length > 0) {
        state.articles = [...state.articles,...feed];
      }
    },
    add(state, { key, content }) {
      state[key].push(content);
    },
    remove(state, { key, filter }) {
      state[key] = state[key].filter(filter);
    },
    edit(state, { key, find, content }) {
      const target = state[key].find(find);
      if (typeof target === "undefined") {
        return;
      }
      const index = state[key].indexOf(target);
      const array = [...state[key]];
      Object.keys(content).forEach(key => {
        target[key] = content[key];
      });
      array[index] = target;
      state[key] = array;
    },
    fill(state, { key, content }) {
      state[key] = content;
    },
    connected(state, value) {
      state.connected = value;
    },
    online(state,value) {
      state.online = value;
    },
    login(state, value) {
      state.login = value;
    },
    logoff(state) {
      state.login = false;
      state.connected = false;
      state.tags = [];
      state.notes = [];
      state.rss = [];
      state.articles = [];
    }
  },
  actions: {
    //commit mutations in store / gists / localStorage
    async connectAction({commit, state}) {
      ["tags","notes","rss"].forEach(key => {
        const content = localStorage.getItem(key);
        if (content) {
          commit("fill",{ key, content: JSON.parse(content) });
        }
      });
      if (state.connected !== true
        && typeof state.login !== "boolean") {
        commit("connected","pending");
        gist = new DataGists(state.login);
        await gist.init();
        let gist_list = await gist.listGists();
        if (gist_list.filter((e) => (e.description == GIST_DESC)).length == 0) {
          // No SpektiGist has been found, we shall create one
          let gist_id = await gist.createGist("rss","[]",GIST_DESC);
          gist = await gist.useGist({id:gist_id});
        } else {
          gist = await gist.useGist({description:GIST_DESC});
        }
        commit("connected",true);
        console.info("connected to gist");
        Object.keys(gist.files).forEach(key => { //populate store & localStorage with retrieved objects
          if (["tags","notes","rss"].includes(key)) {
            const content = gist.files[key].content;
            commit("fill",{ key, content: JSON.parse(content) });
            if (!localStorage.getItem(key)) { //only populate localstorage this way if empty
              localStorage.setItem(key, content);
            }
          }
        });
        localStorage.setItem("gist", gist.id);
        //should we sync Service Worker here?
      }
    },
    loginAction({commit, dispatch}, token) {
      commit("login", token);
      if (localStorage.getItem("login") != token) {
        localStorage.setItem("login", token);
      }
      dispatch("connectAction");
    },
    onlineAction({commit}, value) {
      commit("online", value);
      let informSW = (online, retry=false) => { // inform service worker about it
        if ("serviceWorker" in navigator) {
          try {
            navigator.serviceWorker.controller.postMessage(JSON.stringify({
              online
            }));
          } catch {
            if (!retry) {
              setTimeout(() => {
                informSW(online, true)
              },10000);
            }
          }
        }
      }
      informSW(value);
    },
    gistChange({commit, state}, { type, key, content, filter, find }) {
      commit(type, { key, content, filter, find });
      gist.putContent(key,JSON.stringify(state[key]));
    },
    addRSS({dispatch, state}, url) {
      console.info("adding rss source "+url);
      let source = state.rss.find(e => e == url);
      if (typeof source === "undefined") {
        dispatch("gistChange", {
          type: "add",
          key: "rss",
          content: url
        });
      }
    },
    removeRSS({dispatch, state}, url) {
      let source = state.rss.find(e => e == url);
      if (typeof source === "undefined") {
        console.warn("source "+url+" not found, deletion aborted");
      } else {
        console.info("removing rss source "+url);
        dispatch("gistChange", {
          type: "remove",
          key: "rss",
          filter: (e => e != url)
        });
      }
    },
    addNote({dispatch, state}, {content, url}) {
      console.info("adding note");
      url = (typeof url === "undefined") ? false : url;
      dispatch("gistChange", {
        type: "add",
        key: "notes",
        content: {
          content,
          url,
          id: Math.max(0,...state.notes.map(e => e.id))+1,
          timestamp: (new Date()).valueOf()
        }
      });
    },
    removeNote({dispatch, state}, id) {
      let note = state.notes.find(e => e.id == id);
      if (typeof note === "undefined") {
        console.warn("note #"+id+" not found, deletion aborted");
      } else {
        console.info("removing note #"+id);
        dispatch("gistChange", {
          type: "remove",
          key: "notes",
          filter: (e => e.id != id)
        });
      }
    },
    editNote({dispatch}, {id, content}) {
      console.info("editing note #"+id);
      dispatch("gistChange", {
        type: "edit",
        key: "notes",
        find: (e => e.id == id),
        content: {
          content,
          timestamp: (new Date()).valueOf()
        }
      });
    },  
    tagArticle({dispatch, state}, {url, title, tag}) {
      console.info("adding tag "+tag+" to url "+url);
      let article = state.tags.find(e => e.url == url);
      if (typeof article === "undefined") { //add new tag on untagged article
        dispatch("gistChange", {
            type: "add",
            key: "tags",
            content: {url,title,tags:[tag]
          }
        });
      } else if (!article.tags.includes(tag)) { //add tag on already tagged article
        dispatch("gistChange", {
          type: "edit",
          key: "tags",
          find: (e => e.url == url),
          content: {
            tags: [...article.tags, tag]
          }
        });
      } else { //remove tag
        let tags = [...article.tags.filter(e => e != tag)];
        if (tags.length == 0) { //no more tags, remove article from tagged articles
          dispatch("gistChange", {
            type: "remove",
            key: "tags",
            filter: (e => e.url != url)
          });
        } else { //only remove tag
          dispatch("gistChange", {
            type: "edit",
            key: "tags",
            find: (e => e.url == url),
            content: { tags }
          });
        }
      }
    },
  },
  getters: {
    notesAbout: (state) => (url) => {
      return state.notes.filter(e => e.url == url) || [];
    },
    tagsAbout: (state) => (url) => {
      return state.tags.find(e => e.url == url) || [];
    },
    otherTags: (state) => (url,tag) => {
      try {
        return state.tags
                .find(article => article.url == url)
                  .tags.filter(t => t != tag);
      } catch {
        return [];
      }
    },
    taggedContent: (state) => (tag) => {
      return state.tags.filter(article => article.tags.includes(tag)) || [];
    },
    allTags: (state) => {
      let all = ["fav","reviewed"];
      state.tags.forEach(article => {
        article.tags.map(tag => {
          if (!all.some(e => e==tag)) {
            all.push(tag);
          }
        });
      });
      return all;
    }
  }
})
