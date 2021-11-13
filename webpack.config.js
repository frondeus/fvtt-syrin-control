const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, 'src/main.ts'),
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: path.resolve(__dirname, "tsconfig.json"),
            transpileOnly: true,
            compilerOptions: {
              noEmit: false
            }
          }
        }
      }
    ]
  },
  output: {
    clean: true,
    path: path.resolve(__dirname, 'scripts'),
    filename: "[name].js"
  },
  resolve: {
    extensions: [".ts"]
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            // npm package names are URL-safe, but some servers don't like @ symbols
            return `${packageName.replace('@', '')}`;
          }
        }
      }
    }
  },
};
