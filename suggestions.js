// suggestions.js

// Handle suggestion form submission
document.getElementById('suggestionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('place-name').value;
    const description = document.getElementById('description').value;
    const picture1 = document.getElementById('picture1').value;
    const picture2 = document.getElementById('picture2').value;
    const picture3 = document.getElementById('picture3').value;
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
  
    // Create a suggestion object matching the backend schema
    const suggestion = {
      name: name,
      description: description,
      pictures: [picture1, picture2, picture3],
      location: { coordinates: [longitude, latitude] }
    };
  
    try {
      const response = await fetch('http://localhost:5000/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestion)
      });
      if (response.ok) {
        alert('Suggestion submitted successfully!');
        document.getElementById('suggestionForm').reset();
        loadSuggestions();
      } else {
        const errorData = await response.json();
        alert('Error submitting suggestion: ' + errorData.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting suggestion.');
    }
  });
  
  // Function to load suggestions within 200 miles of BYUI
  async function loadSuggestions() {
    try {
      // The backend GET endpoint uses default center/radius if no query parameters are provided.
      const response = await fetch('http://localhost:5000/destinations');
      const data = await response.json();
      const placesList = document.getElementById('placesList');
      placesList.innerHTML = '';
  
      data.forEach(place => {
        const div = document.createElement('div');
        div.className = 'place';
        let picturesHtml = '';
        place.pictures.forEach(picUrl => {
          picturesHtml += `<img src="${picUrl}" alt="${place.name}" style="width:100px; margin-right:5px;">`;
        });
        div.innerHTML = `<h3>${place.name}</h3>
                         <p>${place.description}</p>
                         <div class="pictures">${picturesHtml}</div>`;
        placesList.appendChild(div);
      });
    } catch (err) {
      console.error(err);
    }
  }
  
  // Load suggestions when the page loads
  window.addEventListener('load', loadSuggestions);
  