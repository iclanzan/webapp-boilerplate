/* global Backbone, app */
(function (root, Backbone, app, undefined) {
  'use strict';

  app.router = new app.Router();

  app.greetButton = new app.Button({
    parent: 'body',
    label: 'Greet me',
    href: '#greet'
  }).render();

  Backbone.history.start();

})(this, Backbone, app);
