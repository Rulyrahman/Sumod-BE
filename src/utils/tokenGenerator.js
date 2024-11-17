import crypto from 'crypto'

export const generateToken = ( email ) => {
    return crypto.createHash( 'sha256' ).update( email + Date.now() ).digest( 'hex' )
}
