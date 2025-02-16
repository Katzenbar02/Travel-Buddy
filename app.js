// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB (adjust the connection string as needed)
mongoose.connect('mongodb://localhost:27017/travelbuddy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Define a schema for destination suggestions
const DestinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  pictures: { 
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length === 3;
      },
      message: 'Please provide exactly 3 pictures.'
    }
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    }
  }
});
DestinationSchema.index({ location: '2dsphere' });

const Destination = mongoose.model('Destination', DestinationSchema);

// GET endpoint to retrieve destinations within a 200-mile radius of BYUI
app.get('/destinations', async (req, res) => {
  // BYUI center coordinates (Rexburg, ID)
  const defaultCenter = [-111.787, 43.826];
  // Convert 200 miles to radians: 200 / Earth's radius in miles (approx. 3963.2)
  const defaultRadius = 200 / 3963.2;
  
  // Use query parameters if provided; otherwise, default to BYUI center & radius
  const lat = req.query.lat ? parseFloat(req.query.lat) : defaultCenter[1];
  const lng = req.query.lng ? parseFloat(req.query.lng) : defaultCenter[0];
  const radius = req.query.radius ? parseFloat(req.query.radius) / 3963.2 : defaultRadius;

  try {
    const destinations = await Destination.find({
      location: {
        $geoWithin: {
          $centerSphere: [ [lng, lat], radius ]
        }
      }
    });
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST endpoint to add a new destination suggestion
app.post('/destinations', async (req, res) => {
  try {
    const dest = new Destination(req.body);
    await dest.save();
    res.status(201).json(dest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
