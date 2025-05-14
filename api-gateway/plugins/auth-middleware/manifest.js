module.exports = {
  version: "1.3.0",
  init: function(pluginContext) {
    pluginContext.registerPolicy(require("./policies/verify-auth"));
  },
  policies: ["verify-auth"]
};
