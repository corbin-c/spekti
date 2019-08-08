const GIST_DESC = "SpektiGist";
function Sources(gist) {
  this.gist = gist;
  this.addSource = function(type,url) {
  };
  this.removeSource = function(url) {
  };
  this.getSources = async function() {
    let gist_list = await this.gist.listGists();
    if (gist_list.filter((e) => (e.description == GIST_DESC)).length == 0) {
      // No SpektiGist has been found, we shall create one
      this.gist = await this.gist.createGist("rss_sources","no sources",GIST_DESC);
    } else {
      this.gist = await this.gist.useGist({description:GIST_DESC});
    }
  };
}
export { Sources };
