/* global Backbone */
(function (root, Backbone, undefined) {
  'use strict';


  var Person = Backbone.Model.extend({
    promptName: function() {
      var name = window.prompt('Please enter your name:');
      this.set({name: name});
    }
  });

  var GreetingView = Backbone.View.extend({
    tagName: 'h1',

    initialize: function () {
      this.$el.appendTo('body');
    },

    render: function (name) {
      this.$el.text('Hello ' + name + '!');
      return this;
    }
  });

  var Router = Backbone.Router.extend({
    routes: {
      'greet': 'greeter'
    },

    greeter: function() {
      var person = new Person();

      person.on('change:name', function(model, name) {
        app.greetingView.render(name);
      });

      person.promptName();
    }
  });

  Backbone.history.start();

  var app = root.app = {};

  app.router = new Router();
  app.greetingView = new GreetingView();

})(this, Backbone);
