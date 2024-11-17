import bcrypt from 'bcryptjs'
import * as authService from '../services/authService.js'


export const login = async ( req, res ) => {
    const { email, password } = req.body

    try
    {
        const { accessToken, refreshToken } = await authService.loginUser( email, password )
        return res.status( 200 ).json( {
            message: 'Login Successful',
            accessToken,
            refreshToken,
        } )
    } catch ( error )
    {
        return res.status( 400 ).json( { message: error.message } )
    }
}


export const register = async ( req, res ) => {
    const { name, email, password, picture } = req.body

    try
    {
        const hashedPassword = await bcrypt.hash( password, 10 )
        const newUser = await authService.createUser( { name, email, password: hashedPassword, picture } )

        res.status( 201 ).json( { message: 'User registered successfully', user: newUser } )
    } catch ( error )
    {
        res.status( 500 ).json( { message: error.message } )
    }
}


export const refreshToken = async ( req, res ) => {
    const { refreshToken } = req.body

    try
    {
        const newAccessToken = await authService.refreshTokenUser( refreshToken )

        return res.status( 200 ).json( { accessToken: newAccessToken } )
    } catch ( error )
    {
        return res.status( 400 ).json( { message: error.message || 'Invalid Refresh Token' } )
    }
}


export const logout = async ( req, res ) => {
    try
    {
        const { refreshToken } = req.body

        if ( !refreshToken )
        {
            return res.status( 400 ).json( { message: 'Refresh token is required' } )
        }

        await authService.logoutUser( refreshToken )

        return res.status( 200 ).json( { message: 'Logout successful' } )
    } catch ( error )
    {
        const statusCode = error.message === 'Refresh token is required' || 'Invalid or expired token' || 'User not found' || 'No refresh token found for this user' ? 400 : 500
        return res.status( statusCode ).json( { message: error.message } )
    }
}