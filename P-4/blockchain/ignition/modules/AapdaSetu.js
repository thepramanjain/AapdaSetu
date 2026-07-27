const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("AapdaSetuModule", (m) => {
  const aapdaSetu = m.contract("AapdaSetu");
  return { aapdaSetu };
});
