import { RequestHandler } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import CustomError from '../errors/customError';
import httpStatus from 'http-status';
import config from '../config';

const verifyAuth: RequestHandler = (req, _res, next) => {
  console.log('verifyAuth middleware called');
  console.log('Request path:', req.path);
  console.log('Request headers:', req.headers);
  
  const bearerToken = req.headers.authorization;
  console.log('Bearer token:', bearerToken);

  if (bearerToken) {
    const token = bearerToken.split(' ')[1];
    console.log('Extracted token:', token);

    if (token) {
      try {
        const decode = jwt.verify(token, config.jwt_secret as string) as JwtPayload;
        console.log('Decoded token:', decode);

        req.user = {
          _id: decode?._id,
          email: decode?.email
        };
        console.log('Set user in request:', req.user);

        next();
      } catch (error) {
        console.error('Token verification error:', error);
        throw new CustomError(httpStatus.UNAUTHORIZED, 'Unauthorize! please login', 'Unauthorize');
      }
    } else {
      console.log('No token found in bearer token');
      throw new CustomError(httpStatus.UNAUTHORIZED, 'Unauthorize! please login', 'Unauthorize');
    }
  } else {
    console.log('No bearer token found in headers');
    throw new CustomError(httpStatus.UNAUTHORIZED, 'Unauthorize! please login', 'Unauthorize');
  }
};

export default verifyAuth;
