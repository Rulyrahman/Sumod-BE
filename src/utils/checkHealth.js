export const health = async ( res ) => {
    res.status( 200 ).json( {
        status: 'Ok',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    } )
}