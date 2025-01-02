import { Router } from 'express'
import { createMethod, getAllMethods, getMethodById, updateMethod, deleteMethod } from '../controllers/methodController.js'
import { upload } from '../config/uploadFileConfig.js'
const router = Router()


router.post(
    '/method',
    upload.single( 'picture' ),
    createMethod )
router.get(
    '/method',
    getAllMethods
)
router.get(
    '/method/:id',
    getMethodById
)
router.put(
    '/method/:id',
    upload.single( 'picture' ),
    updateMethod )
router.delete(
    '/method/:id',
    deleteMethod )


export default router
