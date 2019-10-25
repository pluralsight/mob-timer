const persister = require("./state-persister");
const sinon = require("sinon");
const fs = require("fs");
const {
  stateFile,
  oldStateFile,
  mobTimerDir
} = require("./state-persister-paths");

describe("state-persister", () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => sandbox.restore());

  describe("read", () => {
    const stateData = { some: "state" };
    const oldStateData = { older: "data" };

    beforeEach(() => {
      sandbox
        .stub(fs, "readFileSync")
        .withArgs(stateFile, "utf-8")
        .callsFake(() => JSON.stringify(stateData))
        .withArgs(oldStateFile, "utf-8")
        .callsFake(() => JSON.stringify(oldStateData));
    });

    it("should return the contents of the state.json file", () => {
      sandbox
        .stub(fs, "existsSync")
        .withArgs(stateFile)
        .callsFake(() => true);

      const result = persister.read();
      expect(result).toEqual(stateData);
    });

    it("should look for the old state file if the new one does not exist", () => {
      sandbox
        .stub(fs, "existsSync")
        .withArgs(stateFile)
        .callsFake(() => false)
        .withArgs(oldStateFile)
        .callsFake(() => true);

      const result = persister.read();
      expect(result).toEqual(oldStateData);
    });

    it("should return an empty object if no state file exists", () => {
      sandbox
        .stub(fs, "existsSync")
        .withArgs(stateFile)
        .callsFake(() => false)
        .withArgs(oldStateFile)
        .callsFake(() => false);

      const result = persister.read();
      expect(result).toEqual({});
    });
  });

  describe("write", () => {
    const stateToWrite = { state: "new" };

    beforeEach(() => {
      sandbox.stub(fs, "writeFileSync");
      sandbox.stub(fs, "mkdirSync");
    });

    it("should write the state to the file", () => {
      sandbox
        .stub(fs, "existsSync")
        .withArgs(mobTimerDir)
        .callsFake(() => true);

      persister.write(stateToWrite);

      sinon.assert.notCalled(fs.mkdirSync);
      sinon.assert.calledWith(
        fs.writeFileSync,
        stateFile,
        JSON.stringify(stateToWrite, null, 2)
      );
    });

    it("should create the directory if needed", () => {
      sandbox
        .stub(fs, "existsSync")
        .withArgs(mobTimerDir)
        .callsFake(() => false);

      persister.write(stateToWrite);

      sinon.assert.calledWith(fs.mkdirSync, mobTimerDir);
      sinon.assert.calledWith(
        fs.writeFileSync,
        stateFile,
        JSON.stringify(stateToWrite, null, 2)
      );
    });
  });
});
