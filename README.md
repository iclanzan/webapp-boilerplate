# Webapp Boilerplate #

## Installation ##

Assuming you have `git` and `node` installed, run:

+ `npm install -g bower gulp`
+ `git clone --depth 1 https://github.com/iclanzan/webapp-boilerplate.git my-app-name`
+ `cd my-app-name`
+ `npm install`

Make sure to change the app name in `package.json`.

## Development ##

Executing `gulp watch` will trigger a dev build, spawn a web server and open the browser to your app. Changes to your project files will cause the project to be automatically rebuilt and the browser refreshed.


## Production ##

Running `grulp` with no arguments will trigger a production build into the `dist` folder.
