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

export const forgotPassword = async ( req, res ) => {
    const { email } = req.body

    try
    {
        const { resetLink, token } = await authService.createResetLink( email )

        res.status( 200 ).json( {
            message: 'Password reset link generated. Use the link below to reset your password:',
            token,
            resetLink: resetLink
        } )
    } catch ( error )
    {
        const statusCode = error.message === 'Email is required' || 'Email not found' ? 400 : 500
        return res.status( statusCode ).json( { message: error.message } )
    }
}

export const getResetPassword = async ( req, res ) => {
    const { token, email } = req.query

    const result = await authService.validateResetToken( email, token )

    if ( result.isValid )
    {
        res.status( 200 ).json( {
            message: 'Token is valid. You can now reset your password.',
            token: result.tokenData.token
        } )
    } else
    {
        res.status( 400 ).json( { message: result.message } )
    }
}

export const resetPassword = async ( req, res ) => {
    const { email, token, newPassword } = req.body

    try
    {
        const result = await authService.validateResetToken( email, token )

        if ( !result.isValid )
        {
            return res.status( 400 ).json( { message: result.message } )
        }

        await authService.updatePassword( email, newPassword )

        res.status( 200 ).json( { message: 'Password has been successfully updated' } )
    } catch ( error )
    {
        res.status( 500 ).json( { message: 'An error occurred', error: error.message } )
    }
}

export const getAllUsers = async ( req, res ) => {
    try
    {
        const page = req.query.page || 1
        const limit = req.query.limit || 10

        const users = await authService.listUsers( page, limit )
        return res.status( 200 ).json( {
            message: "List users",
            data: users.usersData,
            currentPage: users.currentPage,
            limit: users.limit,
            totalPages: users.totalPages,
            totalUsers: users.totalUsers
        } )
    } catch ( error )
    {
        return res.status( 500 ).json( { message: error.message } )
    }
}

export const fetchAdminProfile = async ( req, res ) => {
    try
    {
        const admin = await authService.getAdminProfile( req.user.id )
        if ( !admin )
        {
            return res.status( 404 ).json( { message: 'Admin not found' } )
        }
        res.json( {
            message: "Profil user",
            data: admin,
        } )
    } catch ( error )
    {
        res.status( 500 ).json( { message: 'Internal server error', error } )
    }
}
