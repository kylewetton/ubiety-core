const Path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    app: Path.resolve(__dirname, "../src/index.js"),
  },
  output: {
    path: Path.join(__dirname, "../dist"),
    filename: "ubiety.min.js",
    library: "Ubiety",
    libraryTarget: "umd",
    libraryExport: "default",
    umdNamedDefine: true,
  },
  optimization: {
    runtimeChunk: false,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: Path.resolve(__dirname, "../public"), to: "public" }],
    }),
  ],
  resolve: {
    alias: {
      "~": Path.resolve(__dirname, "../src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      },
    ],
  },
};
