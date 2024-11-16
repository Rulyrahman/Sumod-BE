import * as productService from '../services/productService.js'


export const createProduct = async ( req, res ) => {
  try
  {
    const { name, description } = req.body
    const { file: picture } = req
    const newProduct = await productService.createProduct( name, description, picture )

    return res.status( 201 ).json( {
      message: 'Product created successfully',
      data: newProduct,
    } )
  } catch ( error )
  {
    const statusCode = error.message === 'Product name already taken' ? 400 : 500
    return res.status( statusCode ).json( {
      message: error.message,
    } )
  }
}


export const getAllProducts = async ( req, res ) => {
  try
  {
    const page = req.query.page || 1
    const limit = req.query.limit || 10

    const products = await productService.getAllProducts( page, limit )
    return res.status( 200 ).json( {
      message: "List products",
      data: products.productsData,
      currentPage: products.currentPage,
      limit: products.limit,
      totalPages: products.totalPages,
      totalProducts: products.totalProducts
    } )
  } catch ( error )
  {
    return res.status( 500 ).json( { message: error.message } )
  }
}


export const getProductById = async ( req, res ) => {
  const { id } = req.params

  try
  {
    const user = await productService.getSingleProduct( Number( id ) )
    return res.status( 200 ).json( { message: "Product by id", data: user } )
  } catch ( error )
  {
    const statusCode = error.message === 'Product not found' ? 404 : 500
    return res.status( statusCode ).json( { message: error.message } )
  }
}


export const updateProduct = async ( req, res ) => {
  const { id } = req.params
  const { name, description } = req.body
  const { file: picture } = req

  try
  {
    const data = await productService.updateProduct( Number( id ), name, description, picture )
    return res.status( 200 ).json( { message: 'Success updated', data } )
  } catch ( error )
  {
    const statusCode = error.message === 'Product not found' ? 404 : 400
    return res.status( statusCode ).json( { message: error.message } )
  }
}


export const deleteProduct = async ( req, res ) => {
  const { id } = req.params

  try
  {
    await productService.deleteUser( Number( id ) )
    return res.status( 200 ).json( { message: 'Success deleted' } )
  } catch ( error )
  {
    const statusCode = error.message === 'Product not found' ? 404 : 400
    return res.status( statusCode ).json( { message: error.message || 'An unexpected error occurred' } )
  }
}
