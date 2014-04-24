/* global Backbone, app */
(function (root, Backbone, app, undefined) {
  'use strict';

  app.Person = Backbone.Model.extend({
    promptName: function () {
      var name = window.prompt('Please enter your name:');
      this.set({name: name});
    }
  });

  app.GreetingView = Backbone.View.extend({
    tagName: 'h1',

    initialize: function () {
      this.$el.appendTo('body');
    },

    render: function (name) {
      this.$el.text('Hello ' + name + '! The configured color is ' +
        app.config.color + '.');
      return this;
    }
  });

  app.Router = Backbone.Router.extend({
    routes: {
      greet: 'greeter'
    },

    greeter: function () {
      var person = new app.Person();
      var greetingView = new app.GreetingView();

      person.on('change:name', function (model, name) {
        greetingView.render(name);
      });

      person.promptName();
    }
  });

})(this, Backbone, app);
