const { defineConfig } = require("@vue/cli-service");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const CrxWebpackPlugin = require("crx-webpack-plugin");
const ManifestWebpackPlugin = require("./plugins/ManifestWebpackPlugin.js");
const path = require("path");
const { existsSync } = require("fs");

const env = process.env.NODE_ENV;
const pageName = ["popup", "options"];
const pagesObj = {};
const entryName = "plugin";
const keyFile = `./key/${env}.pem`;

pageName.forEach((name) => {
  pagesObj[name] = {
    entry: `src/${name}/index.js`,
    template: `template/${name}.html`,
    filename: `pages/${name}.html`,
  };
});

const devEntryJs = {};
const plugins = [
  new ManifestWebpackPlugin({
    path: path.resolve(__dirname, "manifest.json"),
    filename: "manifest.json",
  }),
];

const config = async () => {
  // 生产和测试环境打包dist为zip
  if (["production", "test"].includes(env)) {
    plugins.push(
      new FileManagerPlugin({
        events: {
          onEnd: {
            archive: [
              {
                source: "./dist",
                destination: `./package/${env}/${entryName}.zip`,
              },
            ],
          },
        },
      })
    );

    (await existsSync(keyFile)) &&
      plugins.push(
        new CrxWebpackPlugin({
          keyFile,
          contentPath: "./dist",
          outputPath: `./package/${env}/`,
          name: entryName,
        })
      );
  } else {
    devEntryJs["hot-reload"] = "./hot-reload.js";
  }

  return {
    pages: pagesObj,
    configureWebpack: {
      mode: env === "development" ? "development" : "production",
      entry: {
        HelloWorld: "./src/matches/HelloWorld/index.js",
        background: "./background.js",
        ...devEntryJs,
      },
      output: {
        filename: "js/[name].js",
      },
      plugins,
    },
    css: {
      extract: false,
    },
    lintOnSave: false,
    chainWebpack: (config) => {
      config.optimization.delete("splitChunks");
    },
  };
};

module.exports = defineConfig(config);
