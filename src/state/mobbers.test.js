let Mobbers = require("./mobbers");
const sinon = require("sinon");

describe("Mobbers", () => {
  let mobbers;

  beforeEach(() => {
    mobbers = new Mobbers();
  });

  describe("on construction", () => {
    it("should have no mobbers", () => {
      let result = mobbers.getAll();
      expect(result).toEqual([]);
    });
  });

  describe("shuffleMobbers", () => {
    let originalRandom;

    beforeEach(() => {
      originalRandom = Math.random;
    });

    afterEach(() => {
      Math.random = originalRandom;
    });

    it("shuffles the mobbers so there is a different order", () => {
      Math.random = sinon.stub();
      Math.random.onCall(0).returns(0.3);
      Math.random.onCall(1).returns(0.5);
      Math.random.onCall(2).returns(0.7);
      Math.random.onCall(3).returns(0.9);
      Math.random.throws(new Error("No more random should be needed!"));
      mobbers.addMobber({ name: "Testerson", id: "mobber-1" });
      mobbers.addMobber({ name: "TestersonFace", id: "mobber-2" });
      mobbers.addMobber({ name: "TestersonHead", id: "mobber-3" });
      mobbers.addMobber({ name: "TestersonNose", id: "mobber-4" });

      mobbers.shuffleMobbers();

      const mobberIds = mobbers.getAll().map(mobber => mobber.id);
      expect(mobberIds).toEqual([
        "mobber-1",
        "mobber-3",
        "mobber-4",
        "mobber-2"
      ]);
    });
  });

  describe("addMobber", () => {
    it("should add a mobber", () => {
      mobbers.addMobber({ name: "Test" });
      let result = mobbers.getAll();
      expect(result[0].name).toBe("Test");
    });

    it("should add an id to the mobber if missing", () => {
      mobbers.addMobber({ name: "Test" });
      let result = mobbers.getAll();
      expect(result[0].id).not.toBe(undefined);
    });

    it("should NOT add an id to the mobber if it already has one", () => {
      mobbers.addMobber({ id: "test-id", name: "Test" });
      let result = mobbers.getAll();
      expect(result[0].id).toBe("test-id");
    });

    it("should always add to the end of the list", () => {
      mobbers.addMobber({ name: "Test 1" });
      mobbers.addMobber({ name: "Test 2" });
      let result = mobbers.getAll();
      expect(result[0].name).toBe("Test 1");
      expect(result[1].name).toBe("Test 2");
    });
  });

  describe("getCurrentAndNextMobbers", () => {
    it("return null values if there are no mobbers", () => {
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result).toEqual({ current: null, next: null });
    });

    it("return the same mobber for current and next if there is only one mobber", () => {
      mobbers.addMobber({ name: "Test" });
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test");
      expect(result.next.name).toBe("Test");
    });

    it("return the current and next mobber when there are 2 mobbers", () => {
      mobbers.addMobber({ name: "Test 1" });
      mobbers.addMobber({ name: "Test 2" });
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 1");
      expect(result.next.name).toBe("Test 2");
    });

    it("should return the correct mobbers after rotating", () => {
      mobbers.addMobber({ name: "Test 1" });
      mobbers.addMobber({ name: "Test 2" });
      mobbers.addMobber({ name: "Test 3" });
      mobbers.rotate();
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 2");
      expect(result.next.name).toBe("Test 3");
    });

    it("should not include disabled mobbers", () => {
      mobbers.addMobber({ name: "Test 1" });
      mobbers.addMobber({ name: "Test 2", disabled: true });
      mobbers.addMobber({ name: "Test 3" });
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 1");
      expect(result.next.name).toBe("Test 3");
    });
  });

  describe("rotate", () => {
    it("should do nothing when there are no mobbers", () => {
      mobbers.rotate();
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result).toEqual({ current: null, next: null });
    });

    it("should do nothing when there is only one mobber", () => {
      mobbers.addMobber({ name: "Test" });
      mobbers.rotate();
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test");
      expect(result.next.name).toBe("Test");
    });

    it("should rotate the mobbers when there are 2", () => {
      mobbers.addMobber({ name: "Test 1" });
      mobbers.addMobber({ name: "Test 2" });
      mobbers.rotate();
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 2");
      expect(result.next.name).toBe("Test 1");
    });

    it("should loop back around after the end of the list", () => {
      mobbers.addMobber({ name: "Test 1" });
      mobbers.addMobber({ name: "Test 2" });
      mobbers.rotate();
      mobbers.rotate();
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 1");
      expect(result.next.name).toBe("Test 2");
    });

    it("should skip disabled mobbers", () => {
      mobbers.addMobber({ name: "Test 1", disabled: true });
      mobbers.addMobber({ name: "Test 2" });
      mobbers.addMobber({ name: "Test 3", disabled: true });
      mobbers.addMobber({ name: "Test 4", disabled: true });
      mobbers.addMobber({ name: "Test 5", disabled: false });
      mobbers.rotate();
      mobbers.rotate();
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 2");
      expect(result.next.name).toBe("Test 5");
    });
  });

  describe("removeMobber", () => {
    it("should not remove anyone if the id does not match", () => {
      mobbers.addMobber({ name: "Test", id: "test-id" });
      mobbers.removeMobber({ name: "Other", id: "other-id" });
      let result = mobbers.getAll();
      expect(result[0].name).toBe("Test");
    });

    it("should remove the mobber that matches by id", () => {
      mobbers.addMobber({ name: "Test 1", id: "1a" });
      mobbers.addMobber({ name: "Test 2", id: "2a" });
      mobbers.addMobber({ name: "Test 1", id: "1b" });
      mobbers.addMobber({ name: "Test 2", id: "2b" });
      mobbers.removeMobber({ name: "Test 1", id: "1b" });
      let result = mobbers.getAll();
      expect(result.length).toBe(3);
      expect(result[0].id).toBe("1a");
      expect(result[1].id).toBe("2a");
      expect(result[2].id).toBe("2b");
    });

    it("should update correctly if the removed mobber was the current mobber", () => {
      mobbers.addMobber({ name: "Test 1", id: "t1" });
      mobbers.addMobber({ name: "Test 2", id: "t2" });
      mobbers.addMobber({ name: "Test 3", id: "t3" });
      mobbers.rotate();
      mobbers.removeMobber({ id: "t2" });
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 3");
      expect(result.next.name).toBe("Test 1");
    });

    it("should wrap around correctly if the removed mobber was current and at the end of the list", () => {
      mobbers.addMobber({ name: "Test 1", id: "t1" });
      mobbers.addMobber({ name: "Test 2", id: "t2" });
      mobbers.addMobber({ name: "Test 3", id: "t3" });
      mobbers.rotate();
      mobbers.rotate();
      mobbers.removeMobber({ id: "t3" });
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 1");
      expect(result.next.name).toBe("Test 2");
    });

    it("should wrap around correctly even if some mobbers are disabled", () => {
      mobbers.addMobber({ name: "Test 1", id: "t1" });
      mobbers.addMobber({ name: "Test 2", id: "t2", disabled: true });
      mobbers.addMobber({ name: "Test 3", id: "t3" });
      mobbers.rotate();
      mobbers.removeMobber({ id: "t3" });
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 1");
      expect(result.next.name).toBe("Test 1");
    });
  });

  describe("updateMobber", () => {
    it("should replace the mobber by matching id", () => {
      mobbers.addMobber({ name: "Test 1", id: "t1" });
      mobbers.addMobber({ name: "Test 2", id: "t2" });
      mobbers.addMobber({ name: "Test 3", id: "t3" });
      mobbers.updateMobber({
        name: "Test 2-updated",
        id: "t2",
        image: "image-path"
      });
      let result = mobbers.getAll();
      expect(result.length).toBe(3);
      expect(result[0].name).toBe("Test 1");
      expect(result[1].name).toBe("Test 2-updated");
      expect(result[2].name).toBe("Test 3");
      expect(result[1].image).toBe("image-path");
    });

    it("should not replace anything if the id does not match", () => {
      mobbers.addMobber({ name: "Test", id: "test-id" });
      mobbers.updateMobber({
        name: "Tester",
        id: "other-id",
        image: "image-path"
      });
      let result = mobbers.getAll();
      expect(result.length).toBe(1);
      expect(result[0].name).toBe("Test");
      expect(result[0].id).toBe("test-id");
      expect(result[0].image).toBe(undefined);
    });

    it("should not change the current mobber when enabling another", () => {
      mobbers.addMobber({ name: "Test 1", id: "t1" });
      mobbers.addMobber({ name: "Test 2", id: "t2", disabled: true });
      mobbers.addMobber({ name: "Test 3", id: "t3" });

      mobbers.rotate();
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 3");
      expect(result.next.name).toBe("Test 1");

      mobbers.updateMobber({ name: "Test 2", id: "t2", disabled: false });
      result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 3");
      expect(result.next.name).toBe("Test 1");
    });

    it("should not change the current mobber when disabling another", () => {
      mobbers.addMobber({ name: "Test 1", id: "t1" });
      mobbers.addMobber({ name: "Test 2", id: "t2" });
      mobbers.addMobber({ name: "Test 3", id: "t3" });

      mobbers.rotate();
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 2");
      expect(result.next.name).toBe("Test 3");

      mobbers.updateMobber({ name: "Test 1", id: "t1", disabled: true });
      result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 2");
      expect(result.next.name).toBe("Test 3");
    });

    it("should go to the next mobber when disabling the current mobber", () => {
      mobbers.addMobber({ name: "Test 1", id: "t1" });
      mobbers.addMobber({ name: "Test 2", id: "t2" });
      mobbers.addMobber({ name: "Test 3", id: "t3" });

      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 1");
      expect(result.next.name).toBe("Test 2");

      mobbers.updateMobber({ name: "Test 1", id: "t1", disabled: true });
      result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 2");
      expect(result.next.name).toBe("Test 3");
    });

    it("should wrap around to the first mobber when disabling the current last mobber", () => {
      mobbers.addMobber({ name: "Test 1", id: "t1" });
      mobbers.addMobber({ name: "Test 2", id: "t2" });
      mobbers.addMobber({ name: "Test 3", id: "t3" });

      mobbers.rotate();
      mobbers.rotate();
      let result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 3");
      expect(result.next.name).toBe("Test 1");

      mobbers.updateMobber({ name: "Test 3", id: "t3", disabled: true });
      result = mobbers.getCurrentAndNextMobbers();
      expect(result.current.name).toBe("Test 1");
      expect(result.next.name).toBe("Test 2");
    });
  });
});
