import { Request, Response } from 'express';
import { json } from 'node:stream/consumers';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import EmailServices from '../services/email.services';

const authController = {
  registerUser: async (req: Request, res: Response) => {
    try {
      const salt = crypto.randomBytes(16).toString('hex'); // tạo một salt ngẫu nhiên
      const hashed = crypto
        .createHash('sha256')
        .update(req.body.password + salt)
        .digest('hex');
      const id = crypto
        .createHash('sha256')
        .update(req.body.email + salt)
        .digest('hex');

      res.status(200).json({ id, hashed });
      // ...
    } catch (error) {
      console.log(error);
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      console.log(req.body.email, req.body.password);

      if (req.body.email === 'duybao13022002@gmail.com' && req.body.password === 'Duybao1302') {
        const accessToken = jwt.sign(
          {
            email: req.body.email,
          },
          'jalsjfasofkjblijasfkjnlkjafjn',
          { expiresIn: '30s' }
        );

        res.status(200).json({ accessToken });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

export default authController;
