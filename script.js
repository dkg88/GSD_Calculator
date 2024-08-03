let dronesData = [];
let isMetric = false; // Default to Imperial units

document.addEventListener('DOMContentLoaded', function () {
  fetch('drones.json') // Adjust the path if necessary
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      dronesData = data.drones;
      populateDroneSelect();
    })
    .catch(error => console.error('Error loading drone data:', error));

  const flightHeightInput = document.getElementById('flight-height');
  const desiredGSDInput = document.getElementById('desired-gsd');
  const flightHeightUpButton = document.getElementById('flight-height-up');
  const flightHeightDownButton = document.getElementById('flight-height-down');
  const desiredGSDUpButton = document.getElementById('desired-gsd-up');
  const desiredGSDDownButton = document.getElementById('desired-gsd-down');
  const imperialButton = document.getElementById('imperial-button');
  const metricButton = document.getElementById('metric-button');
  const resetButton = document.getElementById('reset-button');

  if (flightHeightInput && desiredGSDInput) {
    flightHeightInput.addEventListener('input', handleInput);
    flightHeightInput.addEventListener('blur', handleBlur);
    desiredGSDInput.addEventListener('input', handleInput);
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

  if (resetButton) {
    resetButton.addEventListener('click', resetCalculator);
  }

  updatePlaceholders();
  if (imperialButton) imperialButton.classList.add('active');
});

function populateDroneSelect() {
  const droneSelectButton = document.getElementById('drone-select-button');
  const droneSelectMenu = document.getElementById('drone-select-menu');

  if (droneSelectButton && droneSelectMenu) {
    droneSelectButton.addEventListener('click', () => {
      droneSelectMenu.classList.toggle('dropdown-menu-open');
    });

    dronesData.forEach(drone => {
      const droneOption = document.createElement('div');
      droneOption.className = 'py-2 px-3 cursor-pointer hover:bg-gray-100';
      droneOption.textContent = drone.name;
      droneOption.addEventListener('click', () => {
        selectDrone(drone);
        droneSelectMenu.classList.remove('dropdown-menu-open'); // Close the menu
      });
      droneSelectMenu.appendChild(droneOption);
    });
  }
}

function selectDrone(drone) {
  const droneSelectButton = document.getElementById('drone-select-button');
  if (droneSelectButton) {
    droneSelectButton.textContent = drone.name;
  }
  populateSensorSelect(drone);
  if (drone.sensors.length === 1) {
    updateSensorDetails(drone.sensors[0]); // Automatically update sensor details if only one sensor
  } else {
    clearSensorDetails(); // Clear sensor details if multiple sensors are available
  }
}

function populateSensorSelect(drone) {
  const sensorSelectButton = document.getElementById('sensor-select-button');
  const sensorSelectMenu = document.getElementById('sensor-select-menu');

  if (sensorSelectButton && sensorSelectMenu) {
    sensorSelectMenu.innerHTML = ''; // Clear existing options
    sensorSelectButton.textContent = 'Select Sensor';

    if (drone.sensors.length === 1) {
      sensorSelectButton.textContent = drone.sensors[0].name;
      updateSensorDetails(drone.sensors[0]);
    } else {
      drone.sensors.forEach(sensor => {
        const sensorOption = document.createElement('div');
        sensorOption.className = 'py-2 px-3 cursor-pointer hover:bg-gray-100';
        sensorOption.textContent = sensor.name;
        sensorOption.addEventListener('click', () => {
          selectSensor(sensor);
          sensorSelectMenu.classList.remove('dropdown-menu-open'); // Close the menu
        });
        sensorSelectMenu.appendChild(sensorOption);
      });

      sensorSelectButton.addEventListener('click', () => {
        sensorSelectMenu.classList.toggle('dropdown-menu-open');
      });
    }
  }
}

function selectSensor(sensor) {
  const sensorSelectButton = document.getElementById('sensor-select-button');
  if (sensorSelectButton) {
    sensorSelectButton.textContent = sensor.name;
  }
  updateSensorDetails(sensor);
}

function updateSensorDetails(sensor) {
  document.getElementById('image-width').value = `${sensor.imageWidth} px`;
  document.getElementById('image-height').value = `${sensor.imageHeight} px`;
  document.getElementById('sensor-width').value = `${sensor.sensorWidth} mm`;
  document.getElementById('sensor-height').value = `${sensor.sensorHeight} mm`;
  document.getElementById('focal-length').value = `${sensor.focalLength} mm`;
  document.getElementById('megapixels').value = sensor.megapixels ? `${sensor.megapixels} MP` : '';
}

function clearSensorDetails() {
  document.getElementById('image-width').value = '';
  document.getElementById('image-height').value = '';
  document.getElementById('sensor-width').value = '';
  document.getElementById('sensor-height').value = '';
  document.getElementById('focal-length').value = '';
  document.getElementById('megapixels').value = ''; // Clear megapixels
}

function adjustValue(elementId, increment) {
  const inputElement = document.getElementById(elementId);
  if (inputElement) {
    let value = parseFloat(inputElement.value) || 0;
    value = Math.max(0, value + increment); // Ensure value doesn't go below 0
    inputElement.value = value.toFixed(2);
    handleInput(); // Trigger recalculation
  }
}

function toggleUnits(unit) {
  let flightHeight = parseFloat(document.getElementById('flight-height').value) || 0;
  let desiredGSD = parseFloat(document.getElementById('desired-gsd').value) || 0;

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

  updateInputValue(document.getElementById('flight-height'), flightHeight, isMetric ? 'm' : 'ft');
  updateInputValue(document.getElementById('desired-gsd'), desiredGSD, isMetric ? 'cm/px' : 'in/px');
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

function handleInput() {
  // Perform GSD calculation here if needed
}

function handleBlur(event) {
  if (event.target.value === '') {
    updatePlaceholders();
  }
}

function updateInputValue(inputElement, value, unit) {
  inputElement.value = value.toFixed(2);
  inputElement.placeholder = `Enter ${unit}`;
}

function updatePlaceholders() {
  document.getElementById('flight-height').placeholder = `Enter height in ${isMetric ? 'meters' : 'feet'}`;
  document.getElementById('desired-gsd').placeholder = `Enter GSD in ${isMetric ? 'cm/px' : 'in/px'}`;
}

function showError(message) {
  alert(message);
}

function resetCalculator() {
  document.getElementById('flight-height').value = '';
  document.getElementById('desired-gsd').value = '';
  updatePlaceholders();
  clearSensorDetails();
  const droneSelectButton = document.getElementById('drone-select-button');
  if (droneSelectButton) {
    droneSelectButton.textContent = 'Select Drone';
  }
  const sensorSelectButton = document.getElementById('sensor-select-button');
  if (sensorSelectButton) {
    sensorSelectButton.textContent = 'Select Sensor';
  }
  const resultElement = document.getElementById('result');
  if (resultElement) {
    resultElement.textContent = '';
  }
}
