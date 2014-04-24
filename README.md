# Webapp Boilerplate #

## Installation ##

Assuming you have `git` and `node` installed and you are starting a project from scratch, run:

+ `npm install -g bower gulp`
+ `git clone --depth 1 https://github.com/iclanzan/webapp-boilerplate.git my-app`
+ `cd my-app`
+ `rm -rf .git`
+ `git init`
+ In both `package.json` and `bower.json` replace `"name": "webapp-boilerplate"` with `"name": "my-app"`
+ `npm install`
+ `bower install`


## Local Development ##

Executing `gulp watch` will trigger a dev build which does the following:

1. Lints your scripts, stylesheets and html, and checks the coding style.
2. Spawns a webserver and opens the app in the default browser.
3. Compiles `scss` to `css` and automatically adds vendor prefixes.
4. Precompiles html (_underscore_) templates.
5. Automatically injects scripts and stylesheets (including _bower_ installed dependencies) into `index.html`.
6. Watches project files and when changes occur it rebuilds the app and refreshes the browser.


## Production ##

Running `gulp` with no arguments will trigger a production build into the `output` folder. The app can also be packaged in a zip file under the _archives_ folder if `gulp zip` is used instead.

In addition to the development tasks listed above, a production build:

1. Concatenates scripts.
2. Minifies scripts, stylesheets, html and svg
3. Inlines scripts and stylesheets.
4. Optimizes images (_png_, _jpg_ and _gif_)

When preparing for a new release run `gulp bump`, `gulp bump-minor` or `gulp bump-major` before triggering a build, to bump the patch, minor or major version respectively.


## File Structure ##

This is a simplified example file structure to give an overview of where things reside.

```
.
├─ app
│  ├─ components
│  │  ├─ sidebar
│  │  │  ├─ sidebar.html
│  │  │  └─ _sidebar.scss
│  │  └─ modal
│  │     ├─ modal.html
│  │     ├─ modal.js
│  │     └─ _modal.scss
│  ├─ styles
│  │  ├─ main.scss
│  │  └─ _util.scss
│  ├─ scripts
│  │  ├─ definitions.js
│  │  └─ engine.js
│  ├─ assets
│  │  ├─ favicon.ico
│  │  └─ robots.txt
│  ├─ index.html
│  └─ app.js
├─ output
├─ archives
├─ gulpfile.js
├─ bower.js
└─ package.json
```
