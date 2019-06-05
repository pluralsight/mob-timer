const fs = require("fs");
const electronReleases = require("electron-releases/lite.json");
const packageJson = require("../package.json");
const packageLockJson = require("../package-lock.json");

describe("Node versions", () => {
  const { electronVersion, nodeVersion } = getMatchingElectronReleaseInfo();

  it(`should find node version used by electron (${electronVersion})`, () => {
    expect(nodeVersion.length).toBeTruthy();
  });

  it(`should find node version ${nodeVersion} in .nvmrc`, () => {
    const nvmrc = fs.readFileSync("./.nvmrc", "utf-8");
    expect(nvmrc).toBe(nodeVersion);
  });

  it(`should find node version ${nodeVersion} in .travis.yml`, () => {
    const travisYml = fs.readFileSync("./.travis.yml", "utf-8");
    const matches = travisYml.indexOf(`- "${nodeVersion}"`) !== -1;
    const failMessage = matches
      ? undefined
      : [
          `Could not find node version ${nodeVersion} in .travis.yml!`,
          travisYml
        ].join("\n");
    expect(failMessage).toBeUndefined();
  });

  it(`should find engines node version ${nodeVersion} in package.json`, () => {
    expect(packageJson.engines.node).toBe(nodeVersion);
  });
});

function getMatchingElectronReleaseInfo() {
  const electronVersion = packageLockJson.dependencies.electron.version;
  const exactMatchElectronRelease = electronReleases.find(
    release => release.version === electronVersion
  );
  const majorVersionElectronRelease = electronReleases.find(
    release => release.version[0] === electronVersion[0]
  );
  const foundRelease = exactMatchElectronRelease || majorVersionElectronRelease;
  return {
    electronVersion: foundRelease.version,
    nodeVersion: foundRelease.deps.node
  };
}
