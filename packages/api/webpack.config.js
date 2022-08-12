const path = require("path");
module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "api.js",
    path: path.resolve(__dirname, "../../e2xauthoring/static/js"),
    libraryTarget: "umd",
  },
  optimization: {
    minimize: true,
  },
  externals: {},
};
