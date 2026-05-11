import { Router } from "express";
import { validateUrl } from "../validators/validator.js";
import { 
    createUrl,
    getUrl,
    getStats,
    update,
    removeUrl,
    getAllUrls
} from "../controllers/urlController.js"




const router = Router();

router.get('/', getAllUrls)

router.post('/', validateUrl, createUrl); // middleware handles the 400
router.get('/:shortCode', getUrl);
router.get('/:shortCode/stats', getStats);
router.put('/:shortCode', validateUrl, update);
router.delete('/:shortCode', removeUrl);

export default router;