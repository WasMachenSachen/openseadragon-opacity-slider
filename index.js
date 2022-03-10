import "./src/plugin.js";

let sources = ["images/example-image.png", "images/example-image-bw.png"];

const viewer = OpenSeadragon({
  id: "openseadragon1",
  showNavigationControl: false,
});

// viewer.addTiledImage({
//   tileSource: sources[0],
//   opacity: 0.5,
// });

viewer.addSimpleImage({
  url: sources[1],
});
viewer.addSimpleImage({
  url: sources[0],
});

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
const options = {
  sortable: true,
  showRangeSlider: true,
  showLayerPicker: true,
  showNumberInput: true,
  showRemove: true,
  showtempLayerInformation: true,
  showSliders: true,
  layerPickerHeading: "Ebene wählen",
  layerPickerButtonText: "Layer Picker",
};

viewer.opacityslider({
  ...options,
  layerInformation,
});
