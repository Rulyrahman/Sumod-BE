import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { generateToken } from '../utils/tokenGenerator.js'
const prisma = new PrismaClient()
dotenv.config()
const TOKEN_EXPIRATION_TIME = 1000 //3600000 // 1 jam


const isEmailTakenCreate = async ( email ) => {
    const user = await prisma.user.findUnique( {
        where: { email },
    } )
    return user !== null
}


export const getUserByEmail = async ( email ) => {
    return await prisma.user.findUnique( {
        where: { email },
    } )
}


export const createUser = async ( userData ) => {
    if ( await isEmailTakenCreate( userData.email ) )
    {
        throw new Error( 'Email is already taken by another user' )
    }
    return await prisma.user.create( {
        data: userData,
    } )
}


export const loginUser = async ( email, password ) => {
    const user = await prisma.user.findUnique( { where: { email } } )
    if ( !user )
    {
        throw new Error( 'Invalid Credentials' )
    }

    const isPasswordValid = await bcrypt.compare( password, user.password )
    if ( !isPasswordValid )
    {
        throw new Error( 'Invalid Credentials' )
    }

    const existingRefreshToken = await prisma.refreshToken.findFirst( {
        where: { userId: user.id },
    } )

    if ( existingRefreshToken )
    {
        await prisma.refreshToken.delete( {
            where: { token: existingRefreshToken.token },
        } )
    }

    const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    )

    const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    )

    await prisma.refreshToken.create( {
        data: {
            token: refreshToken,
            userId: user.id,
        },
    } )

    return { accessToken, refreshToken }
}


export const refreshTokenUser = async ( refreshToken ) => {
    if ( !refreshToken )
    {
        throw new Error( 'Refresh Token Required' )
    }

    const decoded = jwt.verify( refreshToken, process.env.REFRESH_TOKEN_SECRET )
    const { id, email } = decoded

    const user = await prisma.user.findUnique( {
        where: { email },
    } )

    if ( !user )
    {
        throw new Error( 'User not found' )
    }

    const existingRefreshToken = await prisma.refreshToken.findFirst( {
        where: { userId: user.id, token: refreshToken },
    } )

    if ( !existingRefreshToken )
    {
        throw new Error( 'No refresh token found for this user' )
    }

    const newAccessToken = jwt.sign(
        { id, email },
        process.env.SECRET_KEY,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    )
    return newAccessToken
}


export const logoutUser = async ( refreshToken ) => {
    if ( !refreshToken )
    {
        throw new Error( 'Refresh token is required' )
    }

    let decoded
    try
    {
        decoded = jwt.verify( refreshToken, process.env.REFRESH_TOKEN_SECRET )
    } catch ( err )
    {
        throw new Error( 'Invalid or expired token' )
    }

    const { email } = decoded

    const user = await prisma.user.findUnique( {
        where: { email },
    } )

    if ( !user )
    {
        throw new Error( 'User not found' )
    }

    const existingRefreshToken = await prisma.refreshToken.findFirst( {
        where: { userId: user.id, token: refreshToken },
    } )

    if ( !existingRefreshToken )
    {
        throw new Error( 'No refresh token found for this user' )
    }

    await prisma.refreshToken.delete( {
        where: { token: refreshToken },
    } )

}


export const createResetLink = async ( email ) => {
    const emailReset = await getUserByEmail( email )
    if ( !emailReset )
    {
        throw new Error( 'Email not found' )
    }

    if ( !email )
    {
        throw new Error( 'Email is required' )
    }

    // Cek jika token aktif dan belum kedaluwarsa
    const activeToken = await prisma.passwordResetToken.findFirst( {
        where: { email },
        orderBy: { createdAt: 'desc' } // Ambil token terbaru
    } )

    if ( activeToken && new Date() < new Date( activeToken.expiresAt ) )
    {
        const resetLink = `http://localhost:5000/api/auth/reset-password?token=${activeToken.token}&email=${email}`
        // Jika token masih aktif, kembalikan token yang masih berlaku
        return { resetLink: resetLink, token: activeToken.token }
    }

    const token = generateToken( email )
    const expirationTime = new Date( Date.now() + process.env.TOKEN_EXPIRATION_TIME )

    // Simpan token di database
    await prisma.passwordResetToken.create( {
        data: {
            email,
            token,
            expiresAt: expirationTime
        }
    } )

    // Buat tautan reset password
    const resetLink = `http://localhost:5000/api/auth/reset-password?token=${token}&email=${email}`

    return { resetLink, token }
}


export const validateResetToken = async ( email, token ) => {
    if ( !email )
    {
        return { isValid: false, message: 'Email is required' }
    }

    if ( !token )
    {
        return { isValid: false, message: 'Token is required' }
    }

    const emailUser = await getUserByEmail( email )
    if ( !emailUser )
    {
        return { isValid: false, message: 'Email not found' }
    }

    const tokenData = await prisma.passwordResetToken.findFirst( {
        where: { email, token },
        orderBy: { createdAt: 'desc' } // Ambil token terbaru
    } )

    if ( !tokenData )
    {
        return { isValid: false, message: 'Token not found' }
    }

    if ( new Date() > tokenData.expiresAt )
    {
        return { isValid: false, message: 'Token has expired' }
    }

    return { isValid: true, tokenData }
}


export const updatePassword = async ( email, newPassword ) => {
    const hashedPassword = await bcrypt.hash( newPassword, 10 )

    // Perbarui password pengguna di database
    await prisma.user.update( {
        where: { email },
        data: { password: hashedPassword }
    } )

    // Hapus token setelah digunakan
    await prisma.passwordResetToken.deleteMany( {
        where: { email }
    } )

}