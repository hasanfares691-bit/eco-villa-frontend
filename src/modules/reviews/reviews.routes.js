// This file was moved from eco-villa-platform

import { Router } from 'express';
import reviewsController from './reviews.controller';

const router = Router();

router.get('/', reviewsController.listReviewsPublic);
router.post('/', reviewsController.createReview);
router.get('/:id', reviewsController.getReviewPublic);

// Admin routes
router.get('/admin', reviewsController.listReviewsAdmin);
router.put('/admin/:id/status', reviewsController.updateReviewStatus);

module.exports = router;