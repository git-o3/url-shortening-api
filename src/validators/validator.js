
export const validateUrl = (req, res, next) => {
    const { url } = req.body;
    if (!url) {
        const error = new Error("URL is required");
        error.statusCode = 400;
        throw error;

    }
    res.locals.url = url
    next();
};