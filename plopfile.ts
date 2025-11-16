import { type NodePlopAPI } from "plop";

export default function (plop: NodePlopAPI) {
  plop.setGenerator("package", {
    description: "create a new kino fns package",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "package name",
      },
      {
        type: "input",
        name: "description",
        message: "package description",
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/{{name}}/package.json",
        templateFile: "__templates__/package/package.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{name}}/README.md",
        templateFile: "__templates__/package/README.md.hbs",
      },
      {
        type: "add",
        path: "packages/{{name}}/src/index.ts",
        templateFile: "__templates__/package/src/index.ts.hbs",
      },
      {
        type: "add",
        path: "packages/{{name}}/src/index.spec.ts",
        templateFile: "__templates__/package/src/index.spec.ts.hbs",
      },
      {
        type: "add",
        path: "packages/{{name}}/vitest.config.ts",
        templateFile: "__templates__/package/vitest.config.ts.hbs",
      },
    ],
  });
}
