# openseadragon-opacity-slider
This plugin adds to OSD the functionality to adjust the transparency of superimposed images in the GUI, as well as to adjust their order. 
This can be useful for comparing diffrent maps of the same place, satellite-imagery with diffrent recording dates, images of art captured with different techniques<!-- TODO: (like in the [demo](#)) -->.
<!-- TODO: GIF here -->

<!-- You can try out a demo [here](#). <br />Recordings kindly provided by the [*cda_* - Cranach Digital Archive](https://lucascranach.org/). © Stiftung Museum Kunstpalast, Düsseldorf / Technische Hochschule Köln, 2022   -->

## Requirements
OpenSeaDragon (OSD) > v.3.0.0

## Glossary
For a better understanding of the plugin, here are some terms defined, which we will use in the further:
- **Layer:** Because of the reason that we put several images on top of each other we don't talk about images anymore but about layers. An image thus represents a layer.
- **Layername:** The layername represents the designation of a layer, which can be, for example, the recording date or the recording technique.
- **Layernameexplanation:** The layernameexplanation are additional informations for the user about the layer.
- **Slider:** Each visible layer has a slider to manipulate it. Without any additional [settings](#options-and-methods) a slider consisits of a removal-button, up- and down-buttons for the layerorder, a range slider and a number-input for changing the opacity.
- **Sliderarea:** The sliderarea is the space where all the sliders life.

## Installation
If not already done install OSD as described in the [OSD installation guide](https://openseadragon.github.io/#download).
After that, you can install the Plugin in multiple ways: 
### 1. Via npm/yarn/pnpm
<!-- TODO: Add packagename when in npm! -->
Use the installation-script for your prefered package manager from below:

npm: `npm install XXX`

yarn: `yarn add XXX`

pnpm: `pnpm add XXX`
### 2. Via download 
Download the Plugin [here](https://github.com/WasMachenSachen/openseadragon-opacity-slider/archive/refs/heads/main.zip) and move it into your project directory.

## Setup and Usage
<!-- TODO: Check if everything is right! 
aufteilen in zwei anfangsschritte Mit/ohne OSD
-->
1. Setup OSD, if already done go to 3.

Add div for OSD to your html:
```html
<!-- ... -->
  <div id="openseadragon"></div>
<!-- ... -->
```

2. Create a new OSD-object in your JS and add images (which will become the layers):
```js 
const viewer = OpenSeadragon({
  id: "openseadragon",
});

// Tiled image: 
viewer.addTiledImage({
  tileSource: "<YOUR_TILE_SOURCE>",
  opacity: <START_OPACITY>,
  // More options go here
});

// Simple image:
viewer.addSimpleImage({
  url: "<YOUR_IMAGE_SOURCE>",
  opacity: <START_OPACITY>,
  // More options go here
});
```
> If no opacity is given the layer will have an opacity of 100% (or 1).


3. Setup the additional information of the layers:
```js 
const layerInformation = [
  {
    layerName: "<NAME_OF_THE_LAYER>",
    layerNameExplanation: "<EXPLANATION_OF_THE_LAYER>",
    source: "<YOUR_SOURCE>", // This has to be the same source as in the previous step!
    hidden: <false|true>,
  },
  // One object for each layer
]
```

3. Setup the options for the layers:
```js
const osdosOptions = {
  // Options can go here
}
```

4. Add the plugin to the viewer:
```js
viewer.opacityslider({ ...osdosOptions, layerInformation });
```

If everything is right there should be a basic sliderarea below the OSD-viewer. Now you can style the sliderarea and sliders like described [here](#styling) or change the options like described [below](#options-and-methods).

## Options and Methods
You can set multiple options in your options-object for the output of the sliderarea:
| Option | Type | Default | Explanation | Additional information|
|---|---|---|---|---|
| `showLayerPicker` | Boolean | true | If true, the layerpicker will be displayed | - |
| `showRangeSlider` | Boolean | true | If true, the rangeslider will be displayed | If this and `showNumberInput` are false the user can't change the opacity!  |
| `showNumberInput` | Boolean | true | If true, the numberinput will be displayed | If this and `showRangeSlider` are false the user can't change the opacity!  |
| `showRemove` | Boolean | true | If true, the removebutton will be displayed | This only toggles the remove-button. The user can still hide the layers in the layerpicker. |
| `showLayerInformation` | Boolean | true | If true, the layerinformation will be displayed in the layerpicker. | - |
| `showSliders` | Boolean | true | If true, the sliderarea will be displayed.  | If set to false you probably don't need the plugin ;) |
| `layerPickerHeading` | String | Choose layers:  | Heading for the Layerpicker | - |
| `sortable` | Boolean | true | If true, the up- and down-buttons are displayed | - |
<!-- Blueprint for new Rows: | `` |   |   |   |   | -->

## Styling
For styling you have two options:

### 1. Predefined stylesheets
If you want it simple you can use one of our predefined stylesheets. Right now these stylesheets are availible:
> TBD.
<!-- TODO: Add names, descriptions and images -->
- Sheet 1: One Sentence about it + Image
- Sheet 2: One Sentence about it + Image

Just import one into your HTML-document with the following link-tag: 
<!-- TODO: add link! -->
```html
<!-- ... -->
  <link rel="stylesheet" href="TODO">
<!-- ... -->
``` 

### 2. Build your own stylesheet
If you are not satisfied with the predefined stylesheets or want to customize it more to your styleguide you can create your own stylesheet. For this we have added classes to all elements. 
<!-- TODO: add file and link! -->
> TBD.
In [style-blueprint.css](#) you find all classes you can use for styling. In addition, we have added comments describing on which elements this class owns.

If you want to share your stylesheet with others, feel free to open a [pull request](https://github.com/WasMachenSachen/openseadragon-opacity-slider/pulls)!
## Team and Contribution
This plugin is developed and maintained by this Team: 
<style>
  .contribute-container{
    display:flex; 
    gap: 10px; 
    flex-direction: row;
  }
  @media(max-width: 750px){
     .contribute-container{
      flex-direction: column;
    }
  }
</style>
<div class="contribute-container ">
  <div>
    <img src="https://avatars.githubusercontent.com/u/24228449?s=60&v=4" style="margin: auto; display: block; width: 150px; height: 150px; border-radius: 50%" />
    <span style="display:block;"><a href="https://github.com/WasMachenSachen">@WasMachenSachen</a> | Tim Loges</span>
  </div>
  <div>
    <img src="https://avatars.githubusercontent.com/u/32795896?s=60&v=4" style="margin: auto; display: block; width: 150px; height: 150px; border-radius: 50%" />
    <span style="display:block;"><a href="https://github.com/BenediktEngel">@BenediktEngel</a> | Benedikt Engel</span>
  </div>
  <div>
    <img src="https://avatars.githubusercontent.com/u/76556430?s=60&v=4" style="margin: auto; display: block; width: 150px; height: 150px; border-radius: 50%" />
    <span style="display:block;"><a href="https://github.com/Masch229">@Masch229</a> | Marius Scherff</span>
  </div>
  <div>
    <img src="https://avatars.githubusercontent.com/u/33115432?s=60&v=4" style="margin: auto; display: block; width: 150px; height: 150px; border-radius: 50%" />
    <span style="display:block;"><a href="https://github.com/SickxX">@SickxX</a> | Cristopher Toth</span>
  </div>
</div>

### Contribute

If you want to contribute feel free to build something, but give your best to follow the following steps:

1. Create a new branch with the `dev`-branch as base.
2. Now you can build stuff.
3. For your commit-messages please use the [conventional commits syntax](https://www.conventionalcommits.org/en/v1.0.0/#specification).
4. If everything is done open a pull request onto the `dev`-branch we will look into it and when everything is fine it will get merged. 
5. Your changes will be merged into the `main`-branch with the next version!

## MISC

**Licence:** TBD.

**Problems?** Please open an [issue](https://github.com/WasMachenSachen/openseadragon-opacity-slider/issues), maybe we can help.

**Roadmap:** 

- Add functionality for adjusting the position of a layer in x- and y-direction.
- More stylesheets with different styles. *You have developed a stylesheet and want to share it with others? Feel free to [open](https://github.com/WasMachenSachen/openseadragon-opacity-slider/pulls) a pull request!*
- *Are we missing something you would want? Feel free to [open](https://github.com/WasMachenSachen/openseadragon-opacity-slider/issues) an issue and describe it.*


**Additional Information:** This repository/project is the result of a module in the [Media Informatics Master course](https://www.medieninformatik.th-koeln.de) at [TH Köln](https://www.th-koeln.de). We are doing our best to maintain this project. If you have any wishes, suggestions or questions, please write an [issue](https://github.com/WasMachenSachen/openseadragon-opacity-slider/issues).
