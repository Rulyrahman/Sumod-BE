import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const getVisionMission = async () => {
    const data = await prisma.visionMission.findFirst()
    if ( !data )
    {
        throw new Error( 'Vision and Mission data not found' )
    }
    return data
}

const updateVisionMission = async ( vision, mission ) => {
    const existing = await prisma.visionMission.findFirst()

    if ( typeof vision !== 'string' || typeof mission !== 'string' )
    {
        throw new Error( 'Vision and mission must be in text format.' )
    }


    if ( existing )
    {
        return prisma.visionMission.update( {
            where: { id: existing.id },
            data: { vision, mission },
        } )
    }

    return prisma.visionMission.create( {
        data: { vision, mission },
    } )

}

export { getVisionMission, updateVisionMission }
