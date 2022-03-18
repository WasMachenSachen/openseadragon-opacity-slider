const pluginName = "OpenSeadragon Opacity Slider";
(function ($) {
  /*
   * Check OSD Version
   * TODO: check if Plugin could be working in OSD v2
   */
  if (!$.version || $.version.major < 3) {
    throw new Error(
      `This version of ${pluginName} requires OpenSeadragon version 3.0.0+`
    );
  }

  /**
   * Add method to Openseadragon viewer class
   * @param {Object} options - The options-object given at plugin-setup
   */
  $.Viewer.prototype.opacityslider = function (options) {
    if (!this.Instance) {
      options = options || {};
      options.viewer = this;
      this.opacitysliderInstance = new $.OpacitySlider(options);
    }
  };

  /**
   * Construct the Plugin
   * @constructor
   * @param {Object} options - The options-object given at plugin-setup
   */
  $.OpacitySlider = function (options) {
    /* Check if layerInformation is given and is an array */
    if (!options.layerInformation || !Array.isArray(options.layerInformation)) {
      throw new Error(`${pluginName} requires options.layerInformation`);
    }

    /* Check if a div with the id 'opacitySliderWrapper' is added in the markup. */
    if(!document.getElementById("opacitySliderWrapper")){
      throw new Error(`${pluginName} requires a div with an id of 'opacitySliderWrapper'`);
    }

    /* Set inital hidden values */
    options.layerInformation.forEach((el) => {
      if (!el.hidden) el.hidden = false;
    });
    
    /* Set layerPickerHeading */
    options.layerPickerHeading = options.layerPickerHeading
      ? options.layerPickerHeading
      : "Choose layers:";
    
    /* Add div into the given div for the sliders */
    let opacitySliderDiv = document.createElement("div");
    opacitySliderDiv.id = "opacitySliderWrapperContent";
    document
      .getElementById("opacitySliderWrapper")
      .appendChild(opacitySliderDiv)
      .classList.add("osdos-opacity-layer-slider-wrapper");

    /* Check if the layerPicker is wanted, if yes build it */
    if (options.showLayerPicker || options.showLayerPicker === undefined) {
      buildCheckboxMarkup(options);
    }

    /* Build the markup when items are added to OSD */
    options.viewer.world.addHandler("add-item", function (event) {
      /*
       * Set inital hidden value right at osd image instance:
       * 1. Check type (tileimage or simpleimage)
       * 2. Filter options.layerInformation based on tilesUrl or Url
       * 3. Build markup
       */
      let itemUrl = event.item.source.tilesUrl
        ? `${event.item.source.tilesUrl.slice(0, -7)}.dzi`
        : event.item.source.url;
      let affiliatedLayerInformation = options.layerInformation.filter(
        (el) => el.source === itemUrl
      );
      event.item.osdosHidden = affiliatedLayerInformation.length
        ? affiliatedLayerInformation[0].hidden
        : false;
      buildMarkup(options);
    });
    console.log("Plugin Initialized");
  };

  /**
   * Builds the markup for the layerpicker
   * @param {Object} options - The options-object given at plugin-setup
   */
  function buildCheckboxMarkup(options) {
    /* Build the markup */
    const checkboxWrapper = document.createElement("div");
    checkboxWrapper.classList.add("osdos-layer-picker-wrapper");
    checkboxWrapper.style = "display: none;";
    checkboxWrapper.id = "checkboxWrapperContent";
    let h2 = document.createElement("h2");
    h2.textContent = options.layerPickerHeading;
    checkboxWrapper.appendChild(h2);
    let ul = document.createElement("ul");
    options.layerInformation.forEach((el) => {
      let li = document.createElement("li");
      let explanation =
        options.showLayerInformation ||
        options.showLayerInformation === undefined
          ? `<p>${el.layerNameExplanation}</p>`
          : "";
      li.innerHTML = `
        <input data-osdos='visibility-checkbox' type="checkbox" name="${
          el.layerName
        }" id="${el.layerName}" ${
        el.hidden ? "" : "checked"
      } data-osdos-source="${el.source}"/>
        <label for="${el.layerName}">${el.layerName}</label>
        ${explanation}
      `;
      ul.appendChild(li);
    });
    checkboxWrapper.appendChild(ul);
    document.querySelector("#opacitySliderWrapper").prepend(checkboxWrapper);
    
    /* Add visibility toggle functionality */
    document
      .querySelectorAll("[data-osdos='visibility-checkbox']")
      .forEach((el) => {
        el.addEventListener("click", (event) => {
          toggleVisibility(event, options);
        });
      });
  }

  /**
   * Builds the markup for the sliders.
   * @param {Object} options  - The options-object given at plugin-setup
   */
  function buildMarkup(options) {
    let orderedLayerInformation = getLayerOrder(options);
    let opacitySliderWrapper = document.getElementById(
      "opacitySliderWrapperContent"
    );
    opacitySliderWrapper.innerHTML = ""; //reset

    orderedLayerInformation.forEach((el, index) => {
      const sliderWrapper = document.createElement("div");
      sliderWrapper.className = "osdos-layer-slider";
      sliderWrapper.setAttribute("data-osd-index", index);
      const layerControlsWrapper = document.createElement("div");
      layerControlsWrapper.className = "osdos-layer-controls-wrapper";

      /* Remove button markup */
      if (options.showRemove || options.showRemove === undefined) {
        let removeButton = document.createElement("button");
        removeButton.setAttribute("data-osdos", "remove-button");
        removeButton.classList.add("osdos-layer-slider-remove-button");
        removeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" class="osdos-layer-slider-remove-button-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
        removeButton.addEventListener("click", () =>
          removeLayer(el.source, options)
        );
        layerControlsWrapper.appendChild(removeButton);
      }

      /* Up- and down-button markup */
      if (options.sortable || options.sortable === undefined) {
        const buttonWrapper = document.createElement("div");
        buttonWrapper.className = "osdos-position-controls-wrapper";

        /* Up button markup */
        let buttonUp = document.createElement("button");
        buttonUp.setAttribute("data-osdos", "up-button");
        buttonUp.classList.add("osdos-layer-slider-up-button");
        buttonUp.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" class="osdos-layer-slider-up-button-icon" ><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>`;
        buttonUp.addEventListener("click", () =>
          layerForward(el.source, options)
        );
        buttonWrapper.appendChild(buttonUp);

        /* Down button markup */
        let buttonDown = document.createElement("button");
        buttonDown.setAttribute("data-osdos", "down-button");
        buttonDown.classList.add("osdos-layer-slider-down-button");
        buttonDown.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" class="osdos-layer-slider-down-button-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
        buttonDown.addEventListener("click", () =>
          layerBackward(el.source, options)
        );
        buttonWrapper.appendChild(buttonDown);
        layerControlsWrapper.appendChild(buttonWrapper);
      }

      /* Layername markup  */
      let layerName = document.createElement("span");
      layerName.innerHTML = el.layerName;
      layerName.classList.add("osodos-layer-name-wrapper");
      layerControlsWrapper.appendChild(layerName);

      /* Element for the opacitycontrols */
      let opacityControlsWrapper = document.createElement("div");
      opacityControlsWrapper.classList.add("osodos-opacity-controls-wrapper");
      sliderWrapper.appendChild(layerControlsWrapper);

      /* Opacity rangeslider markup  */
      if (options.showRangeSlider || options.showRangeSlider === undefined) {
        let layerOpacitySlider = document.createElement("input");
        const attributes = {
          "data-osdos": "layer-opacity-slider",
          type: "range",
          min: "0",
          max: "100",
          name: "opacity-slider",
          class: "osdos-layer-slider-range-input",
        };
        Object.keys(attributes).forEach((attr) => {
          layerOpacitySlider.setAttribute(attr, attributes[attr]);
        });
        opacityControlsWrapper.appendChild(layerOpacitySlider);
      }

      /* Opacity numberinput markup */
      if (options.showNumberInput || options.showNumberInput === undefined) {
        let layerOpacitySliderValue = document.createElement("input");
        const attributes = {
          "data-osdos": "layer-opacity-slider-value",
          type: "number",
          min: "0",
          max: "100",
          name: "opacity-slider-value",
          class: "osdos-layer-slider-number-input",
        };
        Object.keys(attributes).forEach((attr) => {
          layerOpacitySliderValue.setAttribute(attr, attributes[attr]);
        });
        opacityControlsWrapper.appendChild(layerOpacitySliderValue);
      }

      sliderWrapper.appendChild(opacityControlsWrapper);

      let currentIndex = findIndexBySource(el.source, options);
      if (options.viewer.world.getItemAt(currentIndex).osdosHidden) {
        sliderWrapper.style = "display: none;";
        setOpacity(currentIndex, 0, options);
      }
      opacitySliderWrapper.appendChild(sliderWrapper);
    });

    document
      .querySelector("#opacitySliderWrapper")
      .appendChild(opacitySliderWrapper);

    /* Add opacity functionality to the rangeslider */
    document
      .querySelectorAll("[data-osdos='layer-opacity-slider']")
      .forEach((el, index) => {
        el.setAttribute("data-osd-index", index);
        ["change", "input"].forEach((eventName) => {
          el.addEventListener(eventName, (event) => {
            setOpacity(index, event.target.value / 100, options);
            if (
              options.showNumberInput ||
              options.showNumberInput === undefined
            ) {
              document.querySelector(
                `[data-osdos='layer-opacity-slider-value'][data-osd-index='${index}']`
              ).value = event.target.value;
            }
          });
        });
      });
    
    /* Add opacity functionality to the numberinput */
    document
      .querySelectorAll("[data-osdos='layer-opacity-slider-value']")
      .forEach((el, index) => {
        el.setAttribute("data-osd-index", index);
        el.addEventListener("input", (event) => {
          setOpacity(index, event.target.value / 100, options);
          if (
            options.showRangeSlider ||
            options.showRangeSlider === undefined
          ) {
            document.querySelector(
              `[data-osdos='layer-opacity-slider'][data-osd-index='${index}']`
            ).value = event.target.value;
          }
        });
      });

    /* Set opacity in slider and input based on the current OSD layer opacity */
    orderedLayerInformation.forEach((el, index) => {
      let currentOpacity = options.viewer.world.getItemAt(index).getOpacity();
      if (options.showNumberInput || options.showNumberInput === undefined) {
        document.querySelector(
          `[data-osdos='layer-opacity-slider-value'][data-osd-index='${index}']`
        ).value = currentOpacity * 100;
      }
      if (options.showRangeSlider || options.showRangeSlider === undefined) {
        document.querySelector(
          `[data-osdos='layer-opacity-slider'][data-osd-index='${index}']`
        ).value = currentOpacity * 100;
      }
    });

    /* Add layerpicker toggle button  */
    if (options.showLayerPicker || options.showLayerPicker === undefined) {
      const checkboxToggleButton = document.createElement("button");
      checkboxToggleButton.className = "osdos-layer-picker-button";
      checkboxToggleButton.innerHTML =
        options.layerPickerButtonText || "Layer Picker";
      checkboxToggleButton.addEventListener(
        "click",
        toggleLayerPickerVisibility
      );
      opacitySliderWrapper.appendChild(checkboxToggleButton);
    }

    /* Disable first up- and last down-button */
    disableButtons(options);
  }

  /** 
   * Toggles the visibility of the layerpicker
   */
  function toggleLayerPickerVisibility() {
    let picker = document.getElementById("checkboxWrapperContent");
    picker.style.display = picker.style.display === "block" ? "none" : "block";
  }

  /**
   * Orders the layers in options object as they are ordered in OSD
   * @param {Object} options - The options-object given at plugin-setup
   * @returns {Array} - Orderd array with all layers
   */
  function getLayerOrder(options) {
    let itemAmount = options.viewer.world.getItemCount();
    let tempLayerInformation = [];
    for (let i = 0; i < itemAmount; i++) {
      /*
       * An Openseadragon tile stores only the tilesUrl, not the .dzi Url.
       * Therefore we have to map these to compare and reorder our layerInformation Array.
       * Every tileUrl ends with _files -> cut and replace it with .dzi and we have the providet source
       * If no tileUrl is given we have a simple image, therefor we only use .url
       */
      let currentOsdItem = options.viewer.world.getItemAt(i);
      let itemUrl = currentOsdItem.source.tilesUrl
        ? `${currentOsdItem.source.tilesUrl.slice(0, -7)}.dzi`
        : currentOsdItem.source.url;
      let temp = options.layerInformation.filter((el) => el.source === itemUrl);
      tempLayerInformation[i] = temp[0];
    }
    return tempLayerInformation;
  }

  /**
   * Finds the Index of an image by the given source
   * @param {String} source - The sourcepath of a layer
   * @param {Object} options - The options-object given at plugin-setup
   * @returns {number} - Index of the layer
   */
  function findIndexBySource(source, options) {
    let itemAmount = options.viewer.world.getItemCount();
    for (let i = 0; i < itemAmount; i++) {
      let currentOsdItem = options.viewer.world.getItemAt(i);
      let itemUrl = currentOsdItem.source.tilesUrl
        ? `${currentOsdItem.source.tilesUrl.slice(0, -7)}.dzi`
        : currentOsdItem.source.url;
      if (source === itemUrl) return i;
    }
    return -1;
  }

  /**
   * Changes the opacity to the given value based of the index
   * @param {number} index - Index of the layer which will get the new opacity
   * @param {number} opacity - New opacity for the layer
   * @param {Object} options - The options-object given at plugin-setup
   */
  function setOpacity(index, opacity, options) {
    options.viewer.world.getItemAt(index).setOpacity(opacity);
  }

  /**
   * Moves the image by the given values based of the index
   * @param {number} index - Index of the layer which will get moved
   * @param {number} x - Delta of the movement in x-direction
   * @param {number} y - Delta of the movement in y-direction
   */
  function moveLayer(index, x, y) {
    let currentPos = viewer.world.getItemAt(index).getBounds();
    viewer.world
      .getItemAt(index)
      .setPosition(
        new OpenSeadragon.Point(currentPos.x + x, currentPos.y + y),
        true
      );
    // TODO: Rebuild the movement Tool
  }

  /**
   * Moves the layer backwards if possible
   * @param {String} source - The sourcepath of the layer
   * @param {Object} options - The options-object given at plugin-setup
   */
  function layerBackward(source, options) {
    let currentIndex = findIndexBySource(source, options);
    if (currentIndex !== 0) {
      options.viewer.world.setItemIndex(
        options.viewer.world.getItemAt(currentIndex),
        currentIndex - 1
      );
      buildMarkup(options);
      // Call this function again when the switched item is hidden
      if (options.viewer.world.getItemAt(currentIndex).osdosHidden) {
        layerBackward(source, options);
      }
    }
  }

  /**
   * Moves the layer forward if possible
   * @param {String} source - The sourcepath of the layer
   * @param {Object} options - The options-object given at plugin-setup
   */
  function layerForward(source, options) {
    let currentIndex = findIndexBySource(source, options);
    if (options.viewer.world.getItemCount() > currentIndex + 1) {
      options.viewer.world.setItemIndex(
        options.viewer.world.getItemAt(currentIndex),
        currentIndex + 1
      );
      buildMarkup(options);
      // Call this function again when the switched item is hidden
      if (options.viewer.world.getItemAt(currentIndex).osdosHidden) {
        layerForward(source, options);
      }
    }
  }

  /**
   * Remove a layer, by setting the opacity to zero and therefore not rendering the corresponding markup
   * @param {String} source - The sourcepath of the layer
   * @param {Object} options - The options-object given at plugin-setup
   */
  function removeLayer(source, options) {
    let currentIndex = findIndexBySource(source, options);
    setOpacity(currentIndex, 0, options);
    options.viewer.world.getItemAt(currentIndex).osdosHidden = true;
    buildMarkup(options);
    if (options.showLayerPicker || options.showLayerPicker === undefined) {
      document.querySelector(`[data-osdos-source="${source}"]`).checked = false;
    }
  }

  /**
   * Adding a layer, by setting the opacity to max(1)
   * @param {String} source - The sourcepath of the layer
   * @param {Object} options - The options-object given at plugin-setup
   */
  function addLayer(source, options) {
    let currentIndex = findIndexBySource(source, options);
    setOpacity(currentIndex, 1, options);
    options.viewer.world.getItemAt(currentIndex).osdosHidden = false;
    buildMarkup(options);
    document.querySelector(`[data-osdos-source="${source}"]`).checked = true;
  }

  /**
   * Toggles the visibility of a layer based on a given event
   * @param {Event} event - The clickevent of a checkbox
   * @param {Object} options - The options-object given at plugin-setup
   */
  function toggleVisibility(event, options) {
    let index = findIndexBySource(
      event.target.getAttribute("data-osdos-source"),
      options
    );
    if (event.target.checked && index != -1) {
      addLayer(event.target.getAttribute("data-osdos-source"), options);
    } else if (!event.target.checked && index != -1) {
      removeLayer(event.target.getAttribute("data-osdos-source"), options);
    }
  }
  
  /**
   * Sets the disabled class for the first up-button and the last down button
   * @param {Object} options - The options-object given at plugin-setup
   */
  function disableButtons(options) {
    // Get all disabled buttons and remove disabled
    document.querySelectorAll(".opacity-slider-disabled").forEach((el) => {
      el.classList.remove("osdos-curser-not-allowed");
      el.disabled = false;
    });
    // Get last down button and set disabled
    let firstElement = document.querySelector(
      "[data-osd-index='0'] [data-osdos='down-button']"
    );
    if (firstElement !== null) {
      firstElement.classList.add("osdos-curser-not-allowed");
      firstElement.disabled = true;
    }
    // Get first up button and set disabled
    let lastElement = document.querySelector(
      `[data-osd-index='${
        options.viewer.world.getItemCount() - 1
      }'] [data-osdos='up-button']`
    );
    if (lastElement !== null) {
      lastElement.classList.add("osdos-curser-not-allowed");
      lastElement.disabled = true;
    }
  }
})(OpenSeadragon);
