import multer from 'multer'


export const multerErrorHandler = ( err, req, res, next ) => {
    if ( err instanceof multer.MulterError )
    {
        if ( err.code === 'LIMIT_UNEXPECTED_FILE' )
        {
            return res.status( 400 ).json( { message: 'Must be a single file' } )
        }
        return res.status( 400 ).json( { message: `Multer error: ${err.message}` } )
    }

    if ( err )
    {
        return res.status( 500 ).json( { message: 'An error occurred', error: err.message } )
    }

    next()
}