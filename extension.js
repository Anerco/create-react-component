"use strict";
const vscode = require("vscode");
const paramCase = require("change-case").paramCase;
const utils = require("./utils");
const { logger, generators } = utils;

function activate(context) {
  let createComponent = (uri, type) => {
    console.log("Create-react-component activated...");

    new Promise(resolve =>
      vscode.window
        .showInputBox({
          prompt: "Enter component name"
        })
        .then(inputValue => resolve(inputValue))
    )
      .then(val => {
        if (val.length === 0) {
          logger("error", "Component name can not be empty!");
          throw new Error("Component name can not be empty!");
        }

        let componentName = paramCase(val);
        let componentDir = generators.createComponentDir(uri, componentName);
        const isTs = type.includes("typescript");

        return Promise.all([
          generators.createComponent(componentDir, componentName, type, isTs),
          generators.createIndex(componentDir, componentName, isTs),
          generators.createCSS(componentDir, componentName)
        ]);
      })
      .then(
        () => logger("success", "React component successfully created!"),
        err => logger("error", err.message)
      );
  };

  const componentsList = [
    {
      type: "functional",
      commandID: "extension.createReactFunctionalComponent"
    },
    {
      type: "functional.typescript",
      commandID: "extension.createReactFunctionalComponentTs"
    }
  ];

  componentsList.forEach(comp => {
    let type = comp.type;
    let disposable = vscode.commands.registerCommand(comp.commandID, uri => {
      createComponent(uri, type);
    });
    context.subscriptions.push(disposable);
  });
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
