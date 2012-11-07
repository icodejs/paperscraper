
define(['Fake'], function (fake) {
  describe("A test for a fake function", function() {
    it("The returnNumber() function should return 1", function() {
      expect(fake.returnNumber()).toEqual(1);
    });
  });
});