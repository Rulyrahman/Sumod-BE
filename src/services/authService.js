import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { generateToken } from '../utils/tokenGenerator.js'
const prisma = new PrismaClient()
dotenv.config()

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

    const activeToken = await prisma.passwordResetToken.findFirst( {
        where: { email },
        orderBy: { createdAt: 'desc' }
    } )

    if ( activeToken && new Date() < new Date( activeToken.expiresAt ) )
    {
        const resetLink = `${process.env.BASE_URL}/api/auth/reset-password?token=${activeToken.token}&email=${email}`
        return { resetLink: resetLink, token: activeToken.token }
    }

    const token = generateToken( email )
    const tokenExpiration = Number( process.env.TOKEN_EXPIRATION_TIME )
    const expirationTime = new Date( Date.now() + tokenExpiration )

    await prisma.passwordResetToken.create( {
        data: {
            email,
            token,
            expiresAt: expirationTime
        }
    } )

    const resetLink = `${process.env.BASE_URL}/api/auth/reset-password?token=${token}&email=${email}`

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
        orderBy: { createdAt: 'desc' }
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

    await prisma.user.update( {
        where: { email },
        data: { password: hashedPassword }
    } )

    await prisma.passwordResetToken.deleteMany( {
        where: { email }
    } )

}

export const listUsers = async ( page, limit ) => {
    const pageParse = Number( page, 10 )
    const limitParse = Number( limit, 10 )
    if ( typeof pageParse !== "number" || isNaN( pageParse ) )
    {
        throw new Error( "Page must be a number" )
    }

    if ( typeof limitParse !== "number" || isNaN( limitParse ) )
    {
        throw new Error( "Limit must be a number" )
    }

    const offset = ( pageParse - 1 ) * limitParse
    const usersData = await prisma.user.findMany( {
        skip: offset,
        take: limitParse,
        select: {
            id: true,
            name: true,
            email: true,
            picture: true,
            createdAt: true,
            updatedAt: true,
        },
    } )

    const totalUsers = await prisma.user.count()

    return {
        usersData,
        currentPage: pageParse,
        limit: limitParse,
        totalPages: Math.ceil( totalUsers / limitParse ),
        totalUsers,
    }
}

export const getAdminProfile = async ( adminId ) => {
    return await prisma.user.findUnique( {
        where: { id: adminId },
        select: {
            id: true,
            name: true,
            email: true,
            picture: true,
            createdAt: true,
            updatedAt: true,
        },
    } )
}