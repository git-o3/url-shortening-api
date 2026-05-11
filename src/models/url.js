import mongoose from "mongoose";

const Schema = mongoose.Schema

const urlSchema = new Schema({
    url: {
        type: String,
        required: true,
        trim: true
    },
    shortCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    accessCount: {
        type: Number,
        default: 0
    },

}, { timestamps: true }); // create createdAt and updatedAt by auto 

    
// transform the output to match the requested JSON format
urlSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Url = mongoose.model("Url", urlSchema)

export default Url