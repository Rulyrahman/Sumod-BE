import express from 'express'
import { login, logout, register, refreshToken, forgotPassword, getResetPassword, resetPassword } from '../controllers/authController.js'

const router = express.Router()


router.post( '/login', login )
router.post( '/logout', logout )
router.post( '/register', register )
router.post( '/refresh-token', refreshToken )
router.post( '/forgot-password', forgotPassword )
router.get( '/reset-password', getResetPassword )
router.post( '/reset-password/new', resetPassword )


export default router
