import { body, param } from 'express-validator';

export const registerValidator = [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
];

export const loginValidator = [
  body('email').isEmail(),
  body('password').notEmpty()
];

export const requestCreateValidator = [
  body('title').trim().notEmpty(),
  body('description').optional().isString()
];

export const requestStatusValidator = [
  param('id').isUUID(),
  body('status').isIn(['approved','rejected']),
  body('adminComment').optional().isString()
];
