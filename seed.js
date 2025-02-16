// seed.js

const mongoose = require('mongoose');

// Connect to your MongoDB database (adjust the URI as needed)
mongoose.connect('mongodb://localhost:27017/travelbuddy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Define the schema and model for destinations
const DestinationSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  }
});
DestinationSchema.index({ location: '2dsphere' });

const Destination = mongoose.model('Destination', DestinationSchema);

// Array of sample destinations in Rexburg/ID, Montana, Wyoming, and Utah
const destinations = [
  {
    name: 'Rexburg Hot Springs',
    description: 'A relaxing natural hot spring near Rexburg, Idaho.',
    location: { coordinates: [-111.787, 43.826] }
  },
  {
    name: 'Yellowstone National Park',
    description: 'Famous for its geysers and wildlife, spanning parts of Montana and Wyoming.',
    location: { coordinates: [-110.5885, 44.4279] }
  },
  {
    name: 'Grand Teton National Park',
    description: 'Spectacular mountain scenery in Wyoming.',
    location: { coordinates: [-110.6818, 43.7904] }
  },
  {
    name: 'Arches National Park',
    description: 'Iconic red rock formations in Utah.',
    location: { coordinates: [-109.5998, 38.7331] }
  },
  {
    name: 'Glacier National Park',
    description: 'Stunning mountain landscapes in Montana.',
    location: { coordinates: [-113.718, 48.696] }
  },
  {
    name: 'Bonneville Salt Flats',
    description: 'Expansive and unique salt flats in Utah.',
    location: { coordinates: [-113.0628, 40.7646] }
  },
  {
    name: 'Jackson Hole',
    description: 'A scenic valley in Wyoming known for its ski resorts and outdoor activities.',
    location: { coordinates: [-110.7624, 43.4799] }
  }
];

async function seedDB() {
  try {
    // Clear existing data if needed
    await Destination.deleteMany({});
    console.log("Cleared previous destinations");

    // Insert the new destinations
    await Destination.insertMany(destinations);
    console.log("Inserted new destinations");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

seedDB();
