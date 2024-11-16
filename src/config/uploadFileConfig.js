import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()


cloudinary.config( {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
} )

const storage = multer.diskStorage( {
    destination: ( req, file, cb ) => {
        cb( null, 'src/uploads/' )
    },
    filename: ( req, file, cb ) => {
        cb( null, Date.now() + '-' + file.originalname )
    },
} )

export const upload = multer( { storage } )