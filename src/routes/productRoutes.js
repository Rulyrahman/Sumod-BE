import { Router } from 'express'
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '../controllers/productController.js'
import { validateEmail } from '../middlewares/validationMiddleware.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { upload } from '../config/uploadFileConfig.js'
const router = Router()


router.post(
    '/product',
    upload.single( 'picture' ),
    createProduct )
router.get(
    '/product',
    // authMiddleware,
    getAllProducts
)
router.get(
    '/product/:id',
    // authMiddleware,
    getProductById
)
router.put(
    '/product/:id',
    upload.single( 'picture' ),
    updateProduct )
router.delete(
    '/product/:id',
    deleteProduct )


export default router
