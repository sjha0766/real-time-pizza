const mongoose = require('mongoose');

// Define the pizza schema
const pizzaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  size: {
    type: String,
    required: true
  }
});

// Create a Pizza model based on the schema
 module.exports= mongoose.model('Menu', pizzaSchema);