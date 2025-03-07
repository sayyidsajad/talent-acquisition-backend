import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req, file, callback) => {
      const filename = `${Date.now()}-${file.originalname}`;
      callback(null, filename);
    },
  }),
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.includes('pdf')) {
      return callback(new BadRequestException('Invalid file type'), false);
    }
    callback(null, true);
  },
};
