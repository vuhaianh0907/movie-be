import express, { Request, Response, Application } from 'express';
import authController from './authController';

const router = express.Router();
router.post('/auth/signup', authController.registerUser);
router.post('/auth/login', authController.login);

export default router;
