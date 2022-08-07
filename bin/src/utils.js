const ora = require("ora");
const inquirer = require("inquirer");
const spinner = ora();
const { execSync } = require("child_process");

const templateList = ["vue2", "vue3"];

async function rmDir(path, loading = false) {
  try {
    if (loading) {
      spinner.text = `正在删除${path}...`;
      spinner.start();
    }
    await execSync(`rm -rf ${path}`);
    if (loading) spinner.succeed(`${path}删除成功`);
  } catch (e) {
    if (loading) spinner.fail(`${path}删除失败`);
    process.exit();
  }
}

async function getTemplate(template) {
  if (!template || !templateList.includes(template)) {
    const { template } = await inquirer.prompt([
      {
        type: "list",
        name: "template",
        message: "请选择插件模板?",
        choices: ["vue2", "vue3"],
      },
    ]);
    return template;
  }
  return template;
}

module.exports = { rmDir, getTemplate };
