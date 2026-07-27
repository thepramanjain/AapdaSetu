const fs = require("fs");
const path = require("path");

async function main() {
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "AapdaSetu.sol",
    "AapdaSetu.json"
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error("AapdaSetu artifact not found. Run npm run compile first.");
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abiDir = path.join(__dirname, "..", "abi");
  fs.mkdirSync(abiDir, { recursive: true });
  fs.writeFileSync(
    path.join(abiDir, "AapdaSetu.json"),
    `${JSON.stringify(artifact.abi, null, 2)}\n`
  );

  console.log("ABI exported to abi/AapdaSetu.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
