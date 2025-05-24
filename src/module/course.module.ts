import mongoose from 'mongoose';

const sliderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  anotherName: {
    type: String,
    required: true,
    trim: true
  },
  poster: {
    type: String,
    required: true
  },
  descriptions: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  quality: {
    type: String,
    required: true
  },
  lang: {
    type: String,
    required: true
  },
  isMovie: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const Slider = mongoose.model('Slider', sliderSchema);

export default Slider; 