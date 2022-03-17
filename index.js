import "./src/plugin.js";

let sources = ["images/example-image.png", "images/example-image-bw.png"];
let viewer;

function initOsdOsPlugin(newOptions) {
  /*
   * Init OSD
   */
  viewer = OpenSeadragon({
    id: "openseadragon1",
    showNavigationControl: false,
  });

  /*
   * Add Tile Image example
   */
  // viewer.addTiledImage({
  //   tileSource: sources[0],
  //   opacity: 0.5,
  // });

  /*
   * Add Simple Image example
   */
  viewer.addSimpleImage({
    url: sources[1],
  });
  viewer.addSimpleImage({
    url: sources[0],
  });

  /*
   * Some basic layer Information
   */
  const layerInformation = [
    {
      layerName: "Example",
      layerNameExplanation: "This is a flower pot",
      source: sources[0],
      hidden: false,
    },
    {
      layerName: "Black and White",
      layerNameExplanation: "This is a flower pot in Black&White",
      source: sources[1],
      hidden: false,
    },
  ];
  /*
   * Enable overwritting options via function parameter to change them dynamic in demo
   */
  const options = newOptions
    ? newOptions
    : {
        sortable: true,
        showRangeSlider: true,
        showLayerPicker: true,
        showNumberInput: true,
        showRemove: true,
        showLayerInformation: true,
        layerPickerHeading: "Choose Layer",
        layerPickerButtonText: "Layer Picker",
      };
  console.log(options);
  /*
   * init opacity slider plugin
   */
  viewer.opacityslider({
    ...options,
    layerInformation,
  });
}
initOsdOsPlugin();

function destroyOsd() {
  viewer.destroy();
  viewer = null;
  document.getElementById("opacitySliderWrapper").innerHTML = "";
}
window.destroyOsd = destroyOsd;
window.initOsdOsPlugin = initOsdOsPlugin;
