import PluginManager from "./plugin-manager";
import resolveConfig from "./config/resolve-config";
import Context from "./context";
import { CloudbaseFrameworkConfig } from "./types";
import getLogger from "./logger";

export { default as Plugin } from "./plugin";
export { default as PluginServiceApi } from "./plugin-sevice-api";
export { Builder } from "./builder";
export { Deployer } from "./deployer";
export * from "./types";

const packageInfo = require("../package");
const SUPPORT_COMMANDS = ["deploy"];

export async function run(
  {
    projectPath,
    cloudbaseConfig,
    logLevel = "info",
    config,
    resourceProviders,
  }: CloudbaseFrameworkConfig,
  command: "deploy" = "deploy",
  module?: string
) {
  const logger = getLogger(logLevel);
  logger.info(`version v${packageInfo.version}`);

  if (!projectPath || !cloudbaseConfig) {
    throw new Error("CloudBase Framework: config info missing");
  }

  const appConfig = await resolveConfig(projectPath, config);

  if (!appConfig) {
    logger.info("⚠️ 未识别到框架配置");
    return;
  }

  const context = new Context({
    appConfig,
    projectConfig: config,
    cloudbaseConfig,
    projectPath,
    logLevel,
    resourceProviders,
  });

  const pluginManager = new PluginManager(context);

  if (!SUPPORT_COMMANDS.includes(command)) {
    throw new Error(`CloudBase Framwork: not support command '${command}'`);
  }

  if (command === "deploy") {
    await pluginManager.init(module);
    await pluginManager.build(module);
    await pluginManager.deploy(module);
  }

  logger.info("✨ done");
}
