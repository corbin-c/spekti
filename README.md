# Spekti

[Spekti](https://github.com/corbin-c/spekti/) is a project by
[Clément Corbin](https://github.com/corbin-c/). Feel free to contribute.

Spekti is a full client-side app to keep an eye on what's matter without wasting
time. It got its name from Espéranto verb meaning « to watch ».
It is powered by [DataGists](https://github.com/corbin-c/datagists/), another
project of mine, which provides a wrapper to use Github's Gists as data storage.
The use of Gists allows the user to retrieve its feeds, bookmarks & notes, no
matter which device he uses. Gists may be set public for easy sharing.

Basically, Spekti is *yet another RSS aggregator*, with a few key features:
* bookmarking relevant articles
* tagging them to keep it organized
* note-taking

More data sources (Twitter, Fediverse, etc.) might be added later.

Unless all your data sources provides CORS headers (which is very unlikely),
you'll need a CORS-Proxy. Spekti default proxy is [CORS-Anywhere](https://github.com/Rob--W/cors-anywhere/)
hosted on Heroku and developped by Rob Wu. (Thank you Rob !) However, please
consider changing this parameter to provide your own proxy.