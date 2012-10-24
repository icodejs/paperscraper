
define(['Common'], function (obj) {

  describe("A test for common.get()", function() {

    it("The get() function should return an object", function() {
      expect(obj.get(4)).toBeNull();
    });

  });

});