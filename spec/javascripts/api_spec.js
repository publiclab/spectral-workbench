describe("API", function() {

  it("should be labelled version 2.0", function() {
    expect(new SpectralWorkbench.API().version).toBe('2.0');
  });


  /*  Test this stuff:

          SpectralWorkbench.API.Core.subtract(_datum, tag.value);

          SpectralWorkbench.API.Core.transform(_datum, tag.value);

          SpectralWorkbench.API.Core.smooth(_datum, tag.value);

          SpectralWorkbench.API.Core.blend(_datum, blend_id, expression);

          SpectralWorkbench.API.Core.range(_datum, +tag.value.split('-')[0], +tag.value.split('-')[1]);

  */

});
