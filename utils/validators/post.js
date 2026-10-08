const { body } = require('express-validator');

const validatePost = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('image').custom((value, { req }) => {
    return true; // Dibuat opsional agar input dari React Native selalu lolos
  }),
];

module.exports = { validatePost };