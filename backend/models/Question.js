
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  domain: { 
    type: String, 
    required: true, 
    enum: ['academic', 'production'],
    index: true 
  },
  q: { type: String, required: true },
  o: [{ type: String, required: true }], 
  a: { type: Number, required: true }   
});

module.exports = mongoose.model('Question', questionSchema);