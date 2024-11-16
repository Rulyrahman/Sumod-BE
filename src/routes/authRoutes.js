import express from 'express'
import { login, logout, register, refreshToken } from '../controllers/authController.js'

const router = express.Router()


router.post( '/login', login )
router.post( '/logout', logout )
router.post( '/register', register )
router.post( '/refresh-token', refreshToken )


export default router
