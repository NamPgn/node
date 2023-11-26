import mongoose from "mongoose";
import { Schema } from "mongoose";

const TypesSchema = new Schema({
  name: {
    type: String,
  },
  path: {
    type: String,
  },
  icon: {
    type: String,
  },
  back: {
    type: String,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  categorymain: [
    {
      cates: {
        type: mongoose.Types.ObjectId,
        ref: 'Categorymain'
      },
      date: {
        type: Date, default: Date.now()
      }
    }
  ],
  products: [
    {
      type: mongoose.Types.ObjectId, ref: 'Products',
    },
    {
      type: Date,
      default: Date.now()
    }
  ],
  category: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Category'
    }
  ]
}, { timestamps: true });

export default mongoose.model('Types', TypesSchema);