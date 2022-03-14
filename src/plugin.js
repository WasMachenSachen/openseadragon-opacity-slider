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
  /*
   * Add method to Openseadragon viewer class
   */
  $.Viewer.prototype.opacityslider = function (options) {
    if (!this.Instance) {
      options = options || {};
      options.viewer = this;
      window.options = options;
      this.opacitysliderInstance = new $.OpacitySlider(options);
    }
  };

  $.OpacitySlider = function (options) {
    /*
     * Check if layerInformation is Array, then add layerControlls for each layer
     */
    if (!options.layerInformation || !Array.isArray(options.layerInformation)) {
      throw new Error(`${pluginName} requires options.layerInformation`);
    }
    /*
     * Set inital options values
     * TODO: set for each? therefore simplify if clauses later on
     */
    options.layerInformation.forEach((el) => {
      if (!el.hidden) el.hidden = false;
    });
    options.layerPickerHeading = options.layerPickerHeading
      ? options.layerPickerHeading
      : "Choose layers:";
    let opacitySliderDiv = document.createElement("div");
    opacitySliderDiv.id = "opacitySliderWrapperContent";
    document
      .getElementById("opacitySliderWrapper")
      .appendChild(opacitySliderDiv)
      .classList.add("osdos-opacity-layer-slider-wrapper");

    /* Checkbox markup option*/
    if (options.showLayerPicker || options.showLayerPicker === undefined) {
      buildCheckboxMarkup(options);
    }
    options.viewer.world.addHandler("add-item", function (event) {
      /*
       * Set inital hidden value right at osd image instance:
       * 1. check type (tileimage or simpleimage)
       * 2. filter options.layerInformation based on tilesUrl or Url
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
      // wait till tiles are actually added
      buildMarkup(options);
    });
    console.log("Plugin Initialized");
  };

  function buildCheckboxMarkup(options) {
    /*
     * Layer selection markup
     */
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
    /*
     * Add visibility toggle functionality
     */
    document
      .querySelectorAll("[data-osdos='visibility-checkbox']")
      .forEach((el) => {
        el.addEventListener("click", (event) => {
          toggleVisibility(event, options);
        });
      });
  }

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
          removeImage(el.source, options)
        );
        layerControlsWrapper.appendChild(removeButton);
      }

      if (options.sortable || options.sortable === undefined) {
        const buttonWrapper = document.createElement("div");
        buttonWrapper.className = "osdos-position-controls-wrapper";
        /* Up button markup */
        let buttonUp = document.createElement("button");
        buttonUp.setAttribute("data-osdos", "up-button");
        buttonUp.classList.add("osdos-layer-slider-up-button");
        buttonUp.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" class="osdos-layer-slider-up-button-icon" ><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>`;
        buttonUp.addEventListener("click", () =>
          imageForward(el.source, options)
        );
        buttonWrapper.appendChild(buttonUp);
        /* Down button markup */
        let buttonDown = document.createElement("button");
        buttonDown.setAttribute("data-osdos", "down-button");
        buttonDown.classList.add("osdos-layer-slider-down-button");
        buttonDown.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" class="osdos-layer-slider-down-button-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
        buttonDown.addEventListener("click", () =>
          imageBackward(el.source, options)
        );
        buttonWrapper.appendChild(buttonDown);
        layerControlsWrapper.appendChild(buttonWrapper);
      }

      /* Add layer name markup  */
      let layerName = document.createElement("span");
      layerName.innerHTML = el.layerName;
      layerName.classList.add("osodos-layer-name-wrapper");
      layerControlsWrapper.appendChild(layerName);
      let opacityControlsWrapper = document.createElement("div");
      opacityControlsWrapper.classList.add("osodos-opacity-controls-wrapper");
      sliderWrapper.appendChild(layerControlsWrapper);

      /* Add layer opacity controls markup  */
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

    /*
     * Add opacity functionality - slider and input box
     */
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

    /*
     * Set opacity in slider and input based on the current OSD layer opacity
     */
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

    /*
     * Add checkbox toggle button
     */
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

    /*
     * Disable First Up-btn and Down-btn
     */
    disableButtons(options.viewer);
  }

  /*
   * toggle visibility of the Layer Picker
   */
  function toggleLayerPickerVisibility() {
    let picker = document.getElementById("checkboxWrapperContent");
    picker.style.display = picker.style.display === "block" ? "none" : "block";
  }
  /*
   * Orders the layers in options object as they are ordered in OSD
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

  /*
   * Finds the Index of an image by the given source
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

  /*
   * Changes the opacity to the given value based of the index
   */
  function setOpacity(index, opacity, options) {
    options.viewer.world.getItemAt(index).setOpacity(opacity);
  }

  /*
   * Moves the image by the given values based of the index
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

  /*
   * Moves the image backwards if possible
   */
  function imageBackward(source, options) {
    let currentIndex = findIndexBySource(source, options);
    if (currentIndex !== 0) {
      options.viewer.world.setItemIndex(
        options.viewer.world.getItemAt(currentIndex),
        currentIndex - 1
      );
      buildMarkup(options);
      // Call this function again when the switched item is hidden
      if (options.viewer.world.getItemAt(currentIndex).osdosHidden) {
        imageBackward(source, options);
      }
    }
  }

  /*
   * Moves the image forward if possible
   */
  function imageForward(source, options) {
    let currentIndex = findIndexBySource(source, options);
    if (options.viewer.world.getItemCount() > currentIndex + 1) {
      options.viewer.world.setItemIndex(
        options.viewer.world.getItemAt(currentIndex),
        currentIndex + 1
      );
      buildMarkup(options);
      // Call this function again when the switched item is hidden
      if (options.viewer.world.getItemAt(currentIndex).osdosHidden) {
        imageForward(source, options);
      }
    }
  }

  /*
   * Remove an image, by setting the opacity to zero and therefore not rendering the corresponding markup
   */
  function removeImage(source, options) {
    let currentIndex = findIndexBySource(source, options);
    setOpacity(currentIndex, 0, options);
    options.viewer.world.getItemAt(currentIndex).osdosHidden = true;
    buildMarkup(options);
    if (options.showLayerPicker || options.showLayerPicker === undefined) {
      document.querySelector(`[data-osdos-source="${source}"]`).checked = false;
    }
  }

  /*
   * Adding an image, by setting the opacity to max(1)
   */
  function addImage(source, options) {
    let currentIndex = findIndexBySource(source, options);
    setOpacity(currentIndex, 1, options);
    options.viewer.world.getItemAt(currentIndex).osdosHidden = false;
    buildMarkup(options);
    document.querySelector(`[data-osdos-source="${source}"]`).checked = true;
  }

  /*
   * Toggles the visibility of a layer based on a given event
   */
  function toggleVisibility(event, options) {
    let index = findIndexBySource(
      event.target.getAttribute("data-osdos-source"),
      options
    );
    if (event.target.checked && index != -1) {
      addImage(event.target.getAttribute("data-osdos-source"), options);
    } else if (!event.target.checked && index != -1) {
      removeImage(event.target.getAttribute("data-osdos-source"), options);
    }
  }

  /*
   * sets the disabled class for the first up-button and the last down button
   */
  function disableButtons(viewer) {
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
        viewer.world.getItemCount() - 1
      }'] [data-osdos='up-button']`
    );
    if (lastElement !== null) {
      lastElement.classList.add("osdos-curser-not-allowed");
      lastElement.disabled = true;
    }
  }
})(OpenSeadragon);
