function ManifestHandle(path) {
  let manifest = require(path);
  if (!["production", "test"].includes(process.env.NODE_ENV)) {
    if (!manifest.background.scripts.includes("js/hot-reload.js")) {
      manifest.background.scripts.push("js/hot-reload.js");
    }
  }
  if (process.env.NODE_ENV === "test") {
    manifest.name += "(测试版)";
  }
  return JSON.stringify(manifest, null, 4);
}

class ManifestWebpackPlugin {
  constructor(options) {
    this.path = options.path || "./";
    this.filename = options.filename || "manifest.json";
  }
  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      "ManifestWebpackPlugin",
      (compilation, callback) => {
        let Manifest = ManifestHandle(this.path);
        compilation.assets[this.filename] = {
          source: function () {
            return Manifest;
          },
          size: function () {
            return Buffer.byteLength(Manifest, "utf8");
          },
        };
        callback();
      }
    );
  }
}
module.exports = ManifestWebpackPlugin;
