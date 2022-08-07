const rewriteFile = require("./rewriteFile");
const download = require("download-git-repo"); // 用于下载远程仓库至本地 支持GitHub、GitLab、Bitbucket
const ora = require("ora"); // 用于命令行上的加载效果
const chalk = require("chalk");
const { exec } = require("child_process");
const spinner = ora();

// 初始化项目
async function init(projectName, templateName) {
  process.chdir(projectName);
  rewriteFile("./manifest.json", {
    name: projectName,
    browser_action: { default_title: projectName },
  });
  rewriteFile("./package.json", { name: projectName });
  rewriteFile("./README.md", projectName, templateName);
  spinner.text = "正在安装依赖...";
  exec("npm install", (error) => {
    if (error) {
      console.log(chalk.red(error));
      return;
    }
    spinner.succeed("项目创建成功");

    console.log();
    console.log("  启动开发服务");
    console.log();
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan(`  npm run serve`));
    console.log();
  });
}

// 生成项目
async function generate(projectName, templateName) {
  spinner.text = `正在下载模板...`;
  spinner.start();
  // 下载模板
  download(
    `github:Ruan8/${templateName}`,
    projectName,
    { clone: true },
    function (err) {
      if (err) {
        spinner.fail("下载失败");
      } else {
        init(projectName, templateName);
      }
    }
  );
}

module.exports = {
  generate,
};
