//import express validator
const { body, check } = require('express-validator');

// Definisikan validasi untuk create post
const validatePost = [
    check('image')
    .custom((value, { req }) => {
      // Check if file is uploaded during creation or update
      if (req.method === 'POST' && !req.file) {
        // If creating (POST) and no file is uploaded, throw an error
        throw new Error('Image is required');
      }

      // No need to check image on update if not provided
      return true;
    }),
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
];

module.exports = { validatePost }
