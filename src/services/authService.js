import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
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