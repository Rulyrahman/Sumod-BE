import express from 'express'
import { login, logout, register, refreshToken, forgotPassword, getResetPassword, resetPassword, getAllUsers, fetchAdminProfile } from '../controllers/authController.js'
import { authMiddleware, validateRefreshToken } from '../middlewares/authMiddleware.js'

const router = express.Router()


router.post( '/login', login )
router.post( '/logout', logout )
router.post( '/register', register )
router.post( '/refresh-token', validateRefreshToken, refreshToken )
router.post( '/forgot-password', forgotPassword )
router.get( '/reset-password', getResetPassword )
router.post( '/reset-password/new', resetPassword )
router.get( '/users', getAllUsers )
router.get( '/profile', authMiddleware, fetchAdminProfile )


export default router
