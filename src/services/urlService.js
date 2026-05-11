import Url from "../models/url.js";
import { nanoid } from "nanoid";


export const listAll = async () => {
    return await Url.find({}); // returns an array of every url in the db
};

export const createShortUrl = async (longUrl) => {
    const newUrl = new Url({
        url: longUrl,
        shortCode: nanoid(6)
    });

    return await newUrl.save();
};

export const getByCode = async (code, increment = false) => {
    let entry;

    if (increment) {
        // perform atomic update & retrieve the document in one go
        entry = await Url.findOneAndUpdate(
            { shortCode: code },
            { $inc: { accessCount: 1 } },
            { new: true }
        );
    } else {
        // just fetch
        entry = await Url.findOne({ shortCode: code });
    }

    // one central place to check for existence
    if (!entry) {
        const error = new Error("Short code not found");
        error.statusCode = 404;
        throw error;
    }

    return entry;
};

export const updateUrl = async (code, newUrl) => {
    const entry = Url.findOneAndUpdate(
        { shortCode: code },
        { url: newUrl },
        { new: true, runValidators: true }
    );

    if (!entry) {
        const error = new Error("Url Short Code not found");
        error.statusCode = 404;
        throw error;
    }
    return entry
};

export const deleteUrl = async (code) => {
    const result = await Url.deleteOne({ shortCode: code });

    if (result.deletedCount === 0) {
        const error = new Error("Short code not found");
        error.statusCode = 404;
        throw error;
    }

    return true;
}

export const getStatsByCode = async (code) => {
    const entry = await Url.findOne({ shortCode: code });

    if (!entry) {
        const error = new Error("Short code not found");
        error.statusCode = 404;
        throw error;
    }
    return entry
};

