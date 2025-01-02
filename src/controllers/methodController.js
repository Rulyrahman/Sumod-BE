import * as methodService from '../services/methodService.js'

export const createMethod = async ( req, res ) => {
  try
  {
    const { name, description } = req.body
    const { file: picture } = req
    const newMethod = await methodService.createMethod( name, description, picture )

    return res.status( 201 ).json( {
      message: 'Method created successfully',
      data: newMethod,
    } )
  } catch ( error )
  {
    const statusCode = error.message === 'Method name already taken' ? 400 : 500
    return res.status( statusCode ).json( {
      message: error.message,
    } )
  }
}


export const getAllMethods = async ( req, res ) => {
  try
  {
    const page = req.query.page || 1
    const limit = req.query.limit || 10

    const methods = await methodService.getAllMethods( page, limit )
    return res.status( 200 ).json( {
      message: "List methods",
      data: methods.methodsData,
      currentPage: methods.currentPage,
      limit: methods.limit,
      totalPages: methods.totalPages,
      totalMethods: methods.totalMethods
    } )
  } catch ( error )
  {
    return res.status( 500 ).json( { message: error.message } )
  }
}


export const getMethodById = async ( req, res ) => {
  const { id } = req.params

  try
  {
    const user = await methodService.getSingleMethod( Number( id ) )
    return res.status( 200 ).json( { message: "Method by id", data: user } )
} catch ( error )
  {
      const statusCode = error.message === 'Method not found' ? 404 : 500
      return res.status( statusCode ).json( { message: error.message } )
  }
}


export const updateMethod = async ( req, res ) => {
  const { id } = req.params
  const { name, description } = req.body
  const { file: picture } = req

  try
  {
    const data = await methodService.updateMethod( Number( id ), name, description, picture )
    return res.status( 200 ).json( { message: 'Success updated', data } )
  } catch ( error )
  {
    const statusCode = error.message === 'Method not found' ? 404 : 400
    return res.status( statusCode ).json( { message: error.message } )
  }
}


export const deleteMethod = async ( req, res ) => {
  const { id } = req.params

  try
  {
    await methodService.deleteUser( Number( id ) )
    return res.status( 200 ).json( { message: 'Success deleted' } )
  } catch ( error )
  {
    const statusCode = error.message === 'Method not found' ? 404 : 400
    return res.status( statusCode ).json( { message: error.message || 'An unexpected error occurred' } )
  }
}
