import { asyncHandler } from "../middleware/asyncHandler.js";
import * as urlService from "../services/urlService.js";



export const getAllUrls = asyncHandler(async (req, res) => {
    const urls = await urlService.listAll();
    
    res.status(200).json({
        success: true,
        count: urls.length,
        data: urls
    });
});

export const createUrl = asyncHandler(async (req, res) => {
    // validation with validator middleawre first
   const { url } = req.body;
    const newUrl = await urlService.createShortUrl(url);
    res.status(201).json(newUrl);
});

export const getUrl = asyncHandler(async (req, res) => {
    const entry = await urlService.getByCode(req.params.shortCode, true);

    res.status(200).json(entry);
});

export const getStats = asyncHandler(async (req, res) => {
    const entry = await urlService.getStatsByCode(req.params.shortCode, false);
    
    res.status(200).json(entry);
});

export const update = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    const { url } = req.body;

    const updatedUrl = await urlService.updateUrl(req.params.shortCode, req.body.url);

    return res.status(204).send();
})

export const removeUrl = asyncHandler(async (req, res) => {
    await urlService.deleteUrl(req.params.shortCode);
    
    res.status(204).send();
})