import { Reader } from "/spekti/reader.js";
import { tagBar } from "/spekti/tagbar.vue.js";

let articleView = {
  data: function() {
    return {
      readerContent: ""
    }
  },
  components: {
    "tag-bar": tagBar
  },
  computed: {
    footer() {
      let footString = this.date;
      if ((this.date == "") && (this.content.author == "")) {
        return "";
      } else if (this.content.author == "") {
        return this.date;
      } else if (this.content.date == "") {
        return this.content.author+" – ";
      }
      return this.content.author+" – "+this.date;
    },
    date() {
      try {
        return this.content.date.toLocaleDateString()
          +" – "+ this.content.date.toLocaleTimeString()+" – ";
      } catch {
        return "";
      }
    },
    contentClasses() {
      return {
        "card-text": this.readerContent.length > 0,
        "spinner-grow": this.readerContent.length == 0,
        "my-3": this.readerContent.length == 0,
        "text-info": this.readerContent.length == 0
      }
    },
    headerClasses() {
      return {
        "card-header": this.fullContent,
        "row":  this.fullContent,
        "no-gutters": this.fullContent,
        "align-items-center": this.fullContent
      }
    },
    articleClasses() {
      return {
        "col": !this.fullContent
      }
    },
    titleClasses() {
      return {
        "card-title": true,
        "card-header": !this.fullContent,
        "col-md-10": this.fullContent,
        "pl-4": this.fullContent,
        "my-auto": this.fullContent,
      }
    },
    imgClasses() {
      return {
        "card-img-top": !this.fullContent,
        "col-md-2": this.fullContent,
        "rounded": this.fullContent,
      }
    },
    abstract() {
      let abstract = this.content.abstract.split(" ");
      let output = [];
      for (let word of abstract) {
        output.push(word)
        if (output.join(" ").length > 300) {
          break;
        }
      }
      return output.join(" ")+" […]";
    }
  },
  methods: {
    async toggleFullContent() {
      this.$parent.$emit("showFullArticle",this.content);
      this.$parent.$emit("hideArticle","");
    },
  },
  async mounted() {
    if (this.fullContent) {
      window.scrollTo(0,0)
      let readerContent = (await Reader(this.content.link));
      if (this.content.title == "") {
        this.content.title = readerContent.title;
      }
      if (this.content.author == "") {
        this.content.author = (readerContent.byline == "")
          ? readerContent.siteName
          : readerContent.byline;
      }
      this.readerContent = readerContent.content;
    } else {
      window.scrollTo(0,this.scroll)
    }
  },
  props: ["content","fullContent","scroll"],
  template: `
  <article v-bind:class="articleClasses">
    <div class="card mb-3">
      <div v-bind:class="headerClasses">
        <img
          v-if="content.img.length > 0"
          v-bind:src="content.img"
          v-bind:class="imgClasses"
          v-on:click="toggleFullContent"
          v-bind:alt="content.title">
        <h3 
          v-bind:class="titleClasses" v-on:click="toggleFullContent">
          {{ content.title }}
        </h3>
      </div>
      <tag-bar v-if="fullContent" v-bind:url="content.link" v-bind:title="content.title"></tag-bar>
      <div class="card-body" v-if="fullContent">
        <p v-html="readerContent" v-bind:class="contentClasses"></p>
      </div>
      <div class="card-body" v-else>
        <p class="card-text">{{ abstract }}</p>
      </div>
      <button type="button" id="close" class="btn btn-info" data-dismiss="modal" aria-label="Close" v-if="fullContent" v-on:click="toggleFullContent">
        <span aria-hidden="true">&times;</span>
      </button>
      <div class="card-footer">
        <p class="card-text">
          <small class="text-muted">
           {{ footer }}<a v-bind:href="content.link" v-bind:title="'Open article « '+content.title+' »'" target="_blank">Source</a>
          </small>
        </p>
      </div>
    </div>
  </article>`
};
export { articleView }
