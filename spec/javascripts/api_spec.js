describe("API", function() {

  it("should be labelled version 2.0", function() {
    expect(new SpectralWorkbench.API().version).toBe('2.0');
  });

  // SpectralWorkbench.API.Legacy.override(_graph);

});
