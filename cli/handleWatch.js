const { exec } = require("child_process");
const killPort = require("kill-port");
const { readFileSync } = require("fs");
const { join } = require("path");

killPort(3000).then(() => {
  const commands = JSON.parse(readFileSync(join(__dirname, "watchExec.json")).toString());
  const handleWatchProcess = exec(["node ./node_modules/pigeon-mode-game-framework/cli/validate", ...commands, "node ./node_modules/pigeon-mode-game-framework/cli/markExecCompleted", "node ./node_modules/pigeon-mode-game-framework/server"].join(" && "))
  handleWatchProcess.stdout.on("data", (data) => {
    console.log(data);
  });
  handleWatchProcess.stderr.on("data", (data) => {
    console.error(data);
  });
});