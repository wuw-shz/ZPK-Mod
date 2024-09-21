import {
  encodeUI,
  tscTask,
  BundleTaskParameters,
  CopyTaskParameters,
  bundleTask,
  cleanTask,
  cleanCollateralTask,
  copyTask,
  coreLint,
  mcaddonTask,
  setupEnvironment,
  ZipTaskParameters,
  STANDARD_CLEAN_PATHS,
  DEFAULT_CLEAN_DIRECTORIES,
  getGameDeploymentRootPaths,
  getOrThrowFromProcess,
  watchTask,
} from "./@compile";
import { argv, parallel, series, task } from "just-task";
import { config } from "./config";
import path from "path";

setupEnvironment(path.resolve(__dirname, ".env"));
const projectName = config.PROJECT_NAME;

let deploymentPath = undefined;
try {
  const product = config.MINECRAFT_PRODUCT;
  deploymentPath = getGameDeploymentRootPaths()[product];
} catch (_) {
  throw new Error("Unable to get deployment path. Make sure to configure package root correctly.");
}
if (deploymentPath === undefined) {
  throw new Error("Deployment path is undefined. Make sure to configure package root correctly.");
}
const bundleTaskOptions: BundleTaskParameters = {
  entryPoint: path.join(__dirname, "./src/zpk.ts"),
  external: ["@minecraft/server", "@minecraft/server-ui"],
  outfile: path.resolve(__dirname, "./dist/src/zpk.js"),
  minifyWhitespace: false,
  sourcemap: true,
  outputSourcemapPath: path.resolve(__dirname, "./dist/debug"),
};

const copyTaskOptions: CopyTaskParameters = {
  copyToBehaviorPacks: [`./behavior_packs/${projectName}`],
  copyToScripts: ["./dist/src"],
  copyToResourcePacks: [`./resource_packs/${projectName}`],
};

const mcaddonTaskOptions: ZipTaskParameters = {
  ...copyTaskOptions,
  outputFile: `./dist/packages/${projectName}.mcaddon`,
};

task("lint", coreLint(["src/**/*"], argv().fix));
task("typescript", tscTask());
task("bundle", bundleTask(bundleTaskOptions));
task("build", series("typescript", "bundle"));
task("clean-local", cleanTask(DEFAULT_CLEAN_DIRECTORIES));
task("clean-collateral", cleanCollateralTask(STANDARD_CLEAN_PATHS));
task("clean", parallel("clean-local", "clean-collateral"));
task(
  "encodeUI",
  encodeUI(
    (copyTaskOptions.copyToResourcePacks || [])[0],
    path.join(deploymentPath, "development_resource_packs", projectName)
  )
);
task("copyPacks", copyTask(copyTaskOptions));
task(
  "copyScripts",
  copyTask({
    copyToScripts: copyTaskOptions.copyToScripts,
  })
);
task(
  "package",
  watchTask(
    ["behavior_packs/**/*.{json,lang,png}", "resource_packs/**/*.{json,lang,png}"],
    series(...["clean-collateral", "copyPacks", process.env.ENCRYPTOR === "true" ? "encodeUI" : ""].filter(Boolean))
  )
);

task("local-deploy", watchTask(["src/**/*.ts"], series("clean-local", "build", "copyScripts")));
task("createMcaddonFile", mcaddonTask(mcaddonTaskOptions));
task("mcaddon", series("clean-local", "build", "createMcaddonFile"));
