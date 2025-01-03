import { Router } from 'express'
import { getVisionMission, updateVisionMission } from '../controllers/visionMissionController.js'
const router = Router()


router.get( '/vision-mission', getVisionMission )
router.put( '/vision-mission', updateVisionMission )


export default router
