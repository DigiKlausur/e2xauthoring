module.exports = function override(config, env) {
  // Change the options for the htmlWebpackPlugin (plugin number 0)
  config.plugins[0].userOptions.inject = false;
  return config;
};
