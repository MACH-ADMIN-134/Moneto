import { Router } from 'express';
import { featureFlagsService } from '../../services/featureFlags.service.js';
import { sendSuccess } from '../../common/response.js';

const router = Router();

router.get('/', (_req, res) => {
  const flags = featureFlagsService.getFlags();
  sendSuccess(res, flags, 'Feature flags state retrieved successfully');
});

export default router;
