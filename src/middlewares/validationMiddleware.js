export const validateEmail = ( req, res, next ) => {
  const { email } = req.body

  if ( email && email.includes( ' ' ) )
  {
    res.status( 400 ).json( { message: 'Email cannot contain spaces.' } )
    return
  }
  next()
}
