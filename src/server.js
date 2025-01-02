import cors from 'cors'
import express from 'express'
import dotenv from 'dotenv'
import { health } from './utils/checkHealth.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import methodRoutes from './routes/methodRoutes.js'
import { multerErrorHandler } from './middlewares/multerHandler.js'
dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000


app.use( cors() )
app.use( express.json() )


//api health check
app.get( '/api/health', ( req, res ) => { health( res ) } )
//api users
app.use( '/api', productRoutes, methodRoutes )
// api auth
app.use( '/api/auth', authRoutes )




app.use( multerErrorHandler )


app.listen( PORT, () => { console.log( `Server running on http://localhost:${PORT}` ) } )
