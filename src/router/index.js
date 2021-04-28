import Vue from "vue"
import VueRouter from "vue-router"
import Home from "../views/home.vue"
import Main from "../views/main.vue"
import Tag from "../views/tag.vue"
import Notes from "../views/notes.vue"
import Callback from "../views/callback.vue"

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    component: Home,
    children: [
      {
        path: "",
        name: "Main",
        component: Main
      },
      {
        path: "tag/:tag",
        name: "Tag",
        component: Tag,
        props: true
      },
      {
        path: "notes",
        name: "Notes",
        component: Notes
      }
    ]
  },
  {
    path: "/callback",
    name: "Callback",
    component: Callback
  },
  {
    path: "*",
    redirect: "/"
  }
  //~ {
    //~ path: "/about",
    //~ name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    //~ component: () => import(/* webpackChunkName: "about" */ "../views/About.vue")
  //~ }
]

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
})

export default router
