const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const { validateCreateUrl, validateUpdateUrl } = require('./url.validation');
const { createUrl, getMyUrls, getUrlById, updateUrl, deleteUrl } = require('./url.controller');
const { generateQR } = require('./qr.controller');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/urls:
 *   post:
 *     summary: Create a short URL
 *     tags: [URLs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [originalUrl]
 *             properties:
 *               originalUrl:
 *                 type: string
 *                 example: https://www.google.com
 *               customAlias:
 *                 type: string
 *                 example: mygoogle
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Short URL created successfully
 *       409:
 *         description: Custom alias already taken
 */
router.post('/', validateCreateUrl, createUrl);

/**
 * @swagger
 * /api/v1/urls:
 *   get:
 *     summary: Get all URLs for logged in user
 *     tags: [URLs]
 *     responses:
 *       200:
 *         description: URLs fetched successfully
 */
router.get('/', getMyUrls);

/**
 * @swagger
 * /api/v1/urls/{id}/qr:
 *   get:
 *     summary: Generate QR code for a URL
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code image
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:id/qr', generateQR);

/**
 * @swagger
 * /api/v1/urls/{id}:
 *   get:
 *     summary: Get a single URL by ID
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL fetched successfully
 *       404:
 *         description: URL not found
 */
router.get('/:id', getUrlById);

/**
 * @swagger
 * /api/v1/urls/{id}:
 *   patch:
 *     summary: Update a URL
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customAlias:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: URL updated successfully
 */
router.patch('/:id', validateUpdateUrl, updateUrl);

/**
 * @swagger
 * /api/v1/urls/{id}:
 *   delete:
 *     summary: Delete a URL
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL deleted successfully
 */
router.delete('/:id', deleteUrl);

module.exports = router;