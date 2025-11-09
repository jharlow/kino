import { Command } from "commander";
import { init } from "@/commands/init";
import { add } from "./commands/add";

const program = new Command();

program
  .name("kino")
  .description("simple Typescript utility function registry")
  .version("0.0.0");

program.addCommand(init);
program.addCommand(add);

program.parse();
