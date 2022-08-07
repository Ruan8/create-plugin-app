const path = require("path");
const os = require("os");
const _ = require("lodash");
const fs = require("fs");

module.exports = function rewriteFile(filePath, update, source) {
  const fileBuffer = fs.readFileSync(filePath);
  const sourceContent = fileBuffer.toString();
  const isJson = path.extname(filePath) === ".json";

  if (isJson) {
    const sourceJson = JSON.parse(sourceContent);
    fs.writeFileSync(
      filePath,
      JSON.stringify(_.merge(sourceJson, update), null, 2) + os.EOL
    );
  } else {
    const modifiedContent = sourceContent.replace(source || "", update);
    fs.writeFileSync(filePath, modifiedContent + os.EOL);
  }
};
