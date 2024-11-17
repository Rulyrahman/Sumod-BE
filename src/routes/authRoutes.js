import express from 'express'
import { login, logout, register, refreshToken, forgotPassword, getResetPassword, resetPassword } from '../controllers/authController.js'

const router = express.Router()


router.post( '/login', login )
router.post( '/logout', logout )
router.post( '/register', register )
router.post( '/refresh-token', refreshToken )

// Endpoint POST untuk lupa password
router.post( '/forgot-password', forgotPassword )

// Endpoint GET untuk memvalidasi token reset password
router.get( '/reset-password', getResetPassword )

// Endpoint POST untuk mengubah password baru
router.post( '/reset-password/new', resetPassword )


export default router
