let dronesData = [];
let isMetric = false; // Default to Imperial units

document.addEventListener('DOMContentLoaded', function () {
  fetch('drones.json')
    .then(response => response.json())
    .then(data => {
      dronesData = data;
      populateDroneSelect();
      updateCameraSettings();
    })
    .catch(error => console.error('Error loading drone data:', error));

  // Add event listeners safely after DOM has fully loaded
  const flightHeightInput = document.getElementById('flight-height');
  const desiredGSDInput = document.getElementById('desired-gsd');
  const flightHeightUpButton = document.getElementById('flight-height-up');
  const flightHeightDownButton = document.getElementById('flight-height-down');
  const desiredGSDUpButton = document.getElementById('desired-gsd-up');
  const desiredGSDDownButton = document.getElementById('desired-gsd-down');
  const imperialButton = document.getElementById('imperial-button');
  const metricButton = document.getElementById('metric-button');

  if (flightHeightInput && desiredGSDInput) {
    flightHeightInput.addEventListener('input', handleInput);
    flightHeightInput.addEventListener('blur', handleBlur);
    desiredGSDInput.addEventListener('input', handleGSDInput);
    desiredGSDInput.addEventListener('blur', handleBlur);
  }

  if (flightHeightUpButton && flightHeightDownButton) {
    flightHeightUpButton.addEventListener('click', () => adjustValue('flight-height', 1));
    flightHeightDownButton.addEventListener('click', () => adjustValue('flight-height', -1));
  }

  if (desiredGSDUpButton && desiredGSDDownButton) {
    desiredGSDUpButton.addEventListener('click', () => adjustValue('desired-gsd', 0.1));
    desiredGSDDownButton.addEventListener('click', () => adjustValue('desired-gsd', -0.1));
  }

  if (imperialButton && metricButton) {
    imperialButton.addEventListener('click', () => toggleUnits('imperial'));
    metricButton.addEventListener('click', () => toggleUnits('metric'));
  }

  // Initialize placeholders and set default to Imperial units
  updatePlaceholders();
  if (imperialButton) imperialButton.classList.add('active');
});

function populateDroneSelect() {
  const droneSelectButton = document.getElementById('drone-select-button');
  const droneSelectMenu = document.getElementById('drone-select-menu');
  if (!droneSelectButton || !droneSelectMenu) return;

  droneSelectMenu.innerHTML = '';

  dronesData.sort((a, b) => a.name.localeCompare(b.name));

  dronesData.forEach((drone, index) => {
    const option = document.createElement('div');
    option.classList.add('p-2', 'cursor-pointer');
    option.dataset.index = index;
    option.innerHTML = `<span>${drone.name}</span>`;
    option.addEventListener('click', () => {
      droneSelectButton.innerText = drone.name;
      droneSelectMenu.style.display = 'none';
      updateCameraSettings();
    });
    droneSelectMenu.appendChild(option);
  });

  droneSelectButton.addEventListener('click', () => {
    droneSelectMenu.style.display = 'block';
  });
}

function updateCameraSettings() {
  const selectedIndex = dronesData.findIndex(drone => drone.name === document.getElementById('drone-select-button').innerText);
  const drone = dronesData[selectedIndex];

  if (!drone) return;

  document.getElementById('image-width').value = `${drone.imageWidth} px`;
  document.getElementById('image-height').value = `${drone.imageHeight} px`;
  document.getElementById('sensor-width').value = `${drone.sensorWidth} mm`;
  document.getElementById('sensor-height').value = `${drone.sensorHeight} mm`;
  document.getElementById('focal-length').value = `${drone.focalLength} mm`;
  document.getElementById('megapixels').value = `${drone.megapixels} MP`;

  clearInputs();
}

function calculate() {
  const selectedIndex = document.getElementById('drone-select-button').innerText;
  const drone = dronesData.find(d => d.name === selectedIndex);

  if (!drone) {
    showError("Please select a drone first.");
    return;
  }

  const flightHeightInput = document.getElementById('flight-height');
  const desiredGSDInput = document.getElementById('desired-gsd');

  if (flightHeightInput.value) {
    const gsd = calculateGSD(drone, parseFloat(flightHeightInput.value));
    updateInputValue(desiredGSDInput, gsd, isMetric ? 'cm/px' : 'in/px');
  } else if (desiredGSDInput.value) {
    const flightHeight = calculateFlightHeight(drone, parseFloat(desiredGSDInput.value));
    updateInputValue(flightHeightInput, flightHeight, isMetric ? 'm' : 'ft');
  } else {
    showError("Please enter either Flight Height or GSD.");
  }
}

function calculateGSD(drone, flightHeight) {
  const sensorWidth = drone.sensorWidth;
  const focalLength = drone.focalLength;
  const imageWidth = drone.imageWidth;

  let gsd = (sensorWidth * convertFlightHeight(flightHeight) * 100) / (focalLength * imageWidth);
  return isMetric ? gsd : gsd / 2.54;
}

function calculateFlightHeight(drone, desiredGSD) {
  const sensorWidth = drone.sensorWidth;
  const focalLength = drone.focalLength;
  const imageWidth = drone.imageWidth;

  let gsd = isMetric ? desiredGSD : desiredGSD * 2.54;
  let flightHeight = (gsd * focalLength * imageWidth) / (sensorWidth * 100);
  return isMetric ? flightHeight : flightHeight * 3.28084;
}

function handleInput(event) {
  let value = event.target.value;
  if (value.match(/^\d*\.?\d*$/)) {
    event.target.value = value;
    calculate();
  }
}

function handleGSDInput(event) {
  let value = event.target.value;

  if (value.match(/^\d*\.?\d*$/)) {
    event.target.value = value;
    const selectedIndex = document.getElementById('drone-select-button').innerText;
    const drone = dronesData.find(d => d.name === selectedIndex);

    if (drone && value) {
      const gsd = parseFloat(value);
      if (!isNaN(gsd)) {
        const flightHeight = calculateFlightHeight(drone, gsd);
        updateInputValue(document.getElementById('flight-height'), flightHeight, isMetric ? 'm' : 'ft');
      }
    }
  }
}

function handleBlur(event) {
  let value = event.target.value;
  if (value) {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateInputValue(event.target, numValue, getUnitForInput(event.target.id));
    }
  }
}

function updateInputValue(inputElement, value, unit) {
  if (value === 0 || value === '0' || value === '0.00') {
    inputElement.value = '';
    inputElement.placeholder = `Enter ${unit === 'ft' || unit === 'm' ? 'height' : 'GSD'} in ${unit}`;
  } else {
    inputElement.value = value.toFixed(2);
    const unitElement = document.getElementById(`${inputElement.id}-unit`);
    if (unitElement) {
      unitElement.textContent = unit;
    }
  }
}

function getUnitForInput(inputId) {
  return inputId === 'flight-height' ? (isMetric ? 'm' : 'ft') : (isMetric ? 'cm/px' : 'in/px');
}

function adjustValue(id, adjustment) {
  const input = document.getElementById(id);
  let value = parseFloat(input.value) || 0;

  if (id === 'desired-gsd') {
    value += adjustment;
    value = Math.max(value, 0); // Ensure value is non-negative
  } else if (id === 'flight-height') {
    value += adjustment;
  }

  updateInputValue(input, value, getUnitForInput(id));
  calculate();
}

function clearInputs() {
  const flightHeightInput = document.getElementById('flight-height');
  const desiredGSDInput = document.getElementById('desired-gsd');

  if (flightHeightInput && desiredGSDInput) {
    flightHeightInput.value = '';
    desiredGSDInput.value = '';
    updatePlaceholders();
  }

  document.getElementById('flight-height-unit').textContent = isMetric ? 'm' : 'ft';
  document.getElementById('desired-gsd-unit').textContent = isMetric ? 'cm/px' : 'in/px';
}

function toggleUnits(unit) {
  const flightHeightInput = document.getElementById('flight-height');
  const desiredGSDInput = document.getElementById('desired-gsd');

  let flightHeight = parseFloat(flightHeightInput.value) || 0;
  let desiredGSD = parseFloat(desiredGSDInput.value) || 0;

  if (unit === 'metric') {
    if (!isMetric) {
      flightHeight = flightHeight / 3.28084;
      desiredGSD = desiredGSD * 2.54;
    }
    isMetric = true;
  } else {
    if (isMetric) {
      flightHeight = flightHeight * 3.28084;
      desiredGSD = desiredGSD / 2.54;
    }
    isMetric = false;
  }

  updateInputValue(flightHeightInput, flightHeight, isMetric ? 'm' : 'ft');
  updateInputValue(desiredGSDInput, desiredGSD, isMetric ? 'cm/px' : 'in/px');
  updatePlaceholders();

  document.getElementById('flight-height-unit').textContent = isMetric ? 'm' : 'ft';
  document.getElementById('desired-gsd-unit').textContent = isMetric ? 'cm/px' : 'in/px';

  const imperialButton = document.getElementById('imperial-button');
  const metricButton = document.getElementById('metric-button');
  if (imperialButton && metricButton) {
    imperialButton.classList.toggle('active', !isMetric);
    metricButton.classList.toggle('active', isMetric);
  }
}

function updatePlaceholders() {
  document.getElementById('flight-height').placeholder = `Enter height in ${isMetric ? 'meters' : 'feet'}`;
  document.getElementById('desired-gsd').placeholder = `Enter GSD in ${isMetric ? 'cm/px' : 'in/px'}`;
}

function showError(message) {
  alert(message);
}

function convertFlightHeight(height) {
  return isMetric ? height : height / 3.28084;
}
