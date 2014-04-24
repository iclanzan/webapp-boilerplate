/* global Backbone, app */

'use strict';

app.Button = Backbone.View.extend({
  template: app.templates.button,
  initialize: function (properties) {
    this.properties = properties;
    this.$el.appendTo(properties.parent);
  },
  render: function () {
    this.$el.html(this.template(this.properties));
    return this;
  }
});
