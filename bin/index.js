#!/usr/bin/env node
const commander = require("commander"); // 命令行处理工具
const chalk = require("chalk"); // 用于高亮终端打印出的信息
const inquirer = require("inquirer"); // 用于命令行与开发者交互
const ora = require("ora"); // 用于命令行上的加载效果
const download = require("download-git-repo"); // 用于下载远程仓库至本地 支持GitHub、GitLab、Bitbucket
const { exec, execSync } = require("child_process");
const path = require("path");
const _ = require("lodash");
const fs = require("fs");
const os = require("os");
const spinner = ora();

commander
  .arguments("<project-name>")
  .description("<project-name>")
  .usage(`${chalk.green("<project-name>")}`)
  .action(async (projectName) => {
    // 判断是否存在文件夹名称
    if (fs.existsSync(projectName)) {
      const { operate } = await inquirer.prompt([
        {
          type: "list",
          name: "operate",
          message: `${projectName}文件夹已存在`,
          choices: [
            {
              name: "取消",
              value: "cancel",
            },
            {
              name: "删除",
              value: "del",
            },
          ],
        },
      ]);
      if (operate === "cancel") {
        process.exit();
      } else {
        await execSync(`rm -rf ${projectName}`);
        console.log(chalk.green(`成功删除${projectName}文件夹`));
      }
    }

    const { template } = await inquirer.prompt([
      {
        type: "list",
        name: "template",
        message: "请选择插件模板?",
        choices: ["vue2", "vue3"],
      },
    ]);

    const templateName = template + "-plugin-template";
    generate(projectName, templateName);
  });

commander.version(require("../package.json").version).parse(process.argv);

// 重写文件
function rewriteFile(filePath, update, source) {
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
  exec("npm install", (error, stdout, stderr) => {
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
