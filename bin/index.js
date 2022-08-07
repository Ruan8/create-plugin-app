#!/usr/bin/env node
const commander = require("commander"); // 命令行处理工具
const chalk = require("chalk"); // 用于高亮终端打印出的信息
const inquirer = require("inquirer"); // 用于命令行与开发者交互
const fs = require("fs");
const { generate } = require("./src/create");
const { rmDir, getTemplate } = require("./src/utils");

commander
  .arguments("<project-name>")
  .description("create a new project")
  .option("-t,--template-name <template>", "template name")
  .usage(`${chalk.green("<project-name>")}`)
  .action(async (projectName, options) => {
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
        await rmDir(projectName, true);
      }
    }
    const template = await getTemplate(options.templateName);
    const templateName = template + "-plugin-template";
    generate(projectName, templateName);
  });

commander.version(require("../package.json").version).parse(process.argv);
