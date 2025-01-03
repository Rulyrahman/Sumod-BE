import * as visionMissionService from '../services/visionMissionService.js'

const getVisionMission = async ( req, res ) => {
    try
    {
        const data = await visionMissionService.getVisionMission()
        res.json( {
            message: "Get vision and mission",
            data
        } )
    } catch ( error )
    {
        const statusCode = error.message === 'Vision and Mission data not found' ? 404 : 500
        return res.status( statusCode ).json( {
            message: error.message,
        } )
    }
}

const updateVisionMission = async ( req, res, next ) => {
    try
    {
        const { vision, mission } = req.body
        const data = await visionMissionService.updateVisionMission( vision, mission )
        res.json( {
            message: "Update vision and mission successfully",
            data
        } )
    } catch ( error )
    {
        const statusCode = error.message === 'Vision and mission must be in text format.' ? 400 : 500
        return res.status( statusCode ).json( {
            message: error.message,
        } )
    }
}

export { getVisionMission, updateVisionMission }
