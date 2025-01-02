import jwt from 'jsonwebtoken'

export const authMiddleware = ( req, res, next ) => {
    const token = req.header( 'Authorization' )?.replace( 'Bearer ', '' )

    if ( !token )
    {
        return res.status( 401 ).json( { message: 'Unauthorized: No token provided' } )
    }

    try
    {
        const decoded = jwt.verify( token, process.env.SECRET_KEY )
        req.user = decoded // Simpan informasi pengguna di `req.user`
        next()
    } catch ( error )
    {
        if ( error.name === 'TokenExpiredError' )
        {
            return res.status( 401 ).json( { message: 'Access token expired' } )
        }
        return res.status( 400 ).json( { message: 'Invalid or expired token' } )
    }
}

export const validateRefreshToken = ( req, res, next ) => {
    const { refreshToken } = req.body

    if ( !refreshToken )
    {
        return res.status( 401 ).json( { message: 'Unauthorized: No refresh token provided' } )
    }

    try
    {
        const decoded = jwt.verify( refreshToken, process.env.REFRESH_TOKEN_SECRET )
        req.user = decoded // Simpan informasi pengguna di `req.user`
        next()
    } catch ( error )
    {
        if ( error.name === 'TokenExpiredError' )
        {
            return res.status( 401 ).json( { message: 'Refresh token expired' } )
        }
        return res.status( 400 ).json( { message: 'Invalid refresh token' } )
    }
}
