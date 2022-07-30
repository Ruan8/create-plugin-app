#!/usr/bin/env node
const commander = require("commander"); // 命令行处理工具
const chalk = require("chalk"); // 用于高亮终端打印出的信息
const inquirer = require("inquirer"); // 用于命令行与开发者交互
const ora = require("ora"); // 用于命令行上的加载效果
const download = require("download-git-repo"); // 用于下载远程仓库至本地 支持GitHub、GitLab、Bitbucket
const { exec, execSync } = require("child_process");
const path = require("path");
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
      }
    }

    const { template } = await inquirer.prompt([
      {
        type: "list",
        name: "template",
        message: "请选择插件模板?",
        choices: ["vue2"],
      },
    ]);

    const templateName = template + "-plugin-template";
    generate(projectName, templateName);
  });

commander.version(require("../package.json").version).parse(process.argv);

// 重写JSON项目
function rewriteJSONFile(filePath, updateOpt) {
  const fileBuffer = fs.readFileSync(filePath);
  const targetContent = fileBuffer.toString();
  const isJson = path.extname(filePath) === ".json";

  if (isJson) {
    const targetJson = JSON.parse(targetContent);
    fs.writeFileSync(
      filePath,
      JSON.stringify({ ...targetJson, ...updateOpt }, null, 2) + os.EOL
    );
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
        init(projectName);
      }
    }
  );
}

// 初始化项目
async function init(projectName) {
  process.chdir(projectName);
  rewriteJSONFile("./manifest.json", { name: projectName });
  rewriteJSONFile("./package.json", { name: projectName });
  spinner.text = "正在安装依赖...";
  exec("npm install", (error, stdout, stderr) => {
    if (error) {
      console.log(chalk.red(error));
      return;
    }
    spinner.succeed("项目创建成功");
  });
}
