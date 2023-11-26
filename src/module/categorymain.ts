import mongoose from "mongoose";

const categorymainSchema = new mongoose.Schema({
  name: {
    type: String
  },
  linkImg: {
    type: String
  },
  des: {
    type: String
  },
  sumSeri: {
    type: String
  },
  products: [
    {
      type: mongoose.Types.ObjectId, ref: 'Products'
    }
  ],
  type: {
    type: String
  },
  typeId: {
    type: mongoose.Types.ObjectId,
    ref: "Types"
  }
}, { timestamps: true });


export default mongoose.model("Categorymain", categorymainSchema);