# Webapp Boilerplate #

## Installation ##

Ruby and the SASS gem are also required for this boilerplate. Since the boiler plate is intended to be a jump off point for your project, you should already have a project folder created with its own git repo.

Assuming you have `git` and `node` installed, run:

+ `npm install -g bower gulp`
+ `gem install sass`
+ `git clone --depth 1 https://github.com/iclanzan/webapp-boilerplate.git my-boilerplate`
+ `cd my-boilerplate`
+ `rm -rf .git`
+ In both `package.json` and `bower.json` replace `"name": "webapp-boilerplate"` with `"name": "super-cool-app-name"`
+ move all of the contents of ./my-boilerplate folder into your project folder.
+ `npm install`
+ `bower install`

## Local Development ##

Executing `gulp watch` will trigger a dev build, spawn a web server and open the browser to your app. Changes to your project files will cause the project to be automatically rebuilt and the browser refreshed.


## Production ##

Running `gulp` with no arguments will trigger a production build into the `dist` folder.
