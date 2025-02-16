// script.js

// Global map variable
let map;

function initMap() {
  // Initialize the map centered at a default location (e.g., Rexburg, Idaho)
  map = new google.maps.Map(document.getElementById('map-container'), {
    center: { lat: 43.826, lng: -111.787 },
    zoom: 7,
  });

  // Optionally, load all destinations initially:
  // fetchDestinations();
}

// Function to add markers with an info window showing cool facts
function addCoolStop(location, title, description) {
  const marker = new google.maps.Marker({
    position: location,
    map: map,
    title: title,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: `<div class="info-window">
                <h3>${title}</h3>
                <p>${description}</p>
              </div>`,
  });

  marker.addListener('click', () => {
    infoWindow.open(map, marker);
  });
}

// Function to calculate a route and then fetch and display stops along that route
function calculateRouteWithStops(start, end) {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  directionsService.route(
    {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    async (response, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(response);

        // Get route bounds from the response
        const routeBounds = response.routes[0].bounds;
        const ne = routeBounds.getNorthEast();
        const sw = routeBounds.getSouthWest();

        // Fetch destinations within the route bounds from your backend
        try {
          const responseStops = await fetch(`http://localhost:5000/destinations?minLat=${sw.lat()}&maxLat=${ne.lat()}&minLng=${sw.lng()}&maxLng=${ne.lng()}`);
          const stops = await responseStops.json();
          stops.forEach(stop => {
            addCoolStop(
              { lat: stop.location.coordinates[1], lng: stop.location.coordinates[0] },
              stop.name,
              stop.description
            );
          });
        } catch (err) {
          console.error(err);
        }
      } else {
        console.error('Directions request failed due to ' + status);
      }
    }
  );
}

// Handle form submission for setting up a trip route (used in set-map.html)
const setMapForm = document.getElementById('setMapForm');
if (setMapForm) {
  setMapForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const startLocation = document.getElementById('start-location').value;
    const endLocation = document.getElementById('end-location').value;
    // Call the new route calculation function that also fetches stops
    calculateRouteWithStops(startLocation, endLocation);
  });
}

// (Optional) Function to load all destinations without filtering by route bounds
function fetchDestinations() {
  fetch('http://localhost:5000/destinations')
    .then(response => response.json())
    .then(data => {
      data.forEach(dest => {
        addCoolStop(
          { lat: dest.location.coordinates[1], lng: dest.location.coordinates[0] },
          dest.name,
          dest.description
        );
      });
    })
    .catch(err => console.error(err));
}
