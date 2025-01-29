import { BadRequestException } from "@nestjs/common";

export const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
    const allowedMimeTypesPhoto = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedExtensionPhoto = ['jpg', 'jpeg', 'png', 'gif'];
    const allowedMimeTypesVideo = ['video/mp4', 'video/quicktime'];
    const allowedExtensionsVideo = ['mov', 'mp4'];
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
  

    const maxImageSize = 30 * 1024 * 1024; // 30 MB
    const maxVideoSize = 4 * 1024 * 1024 * 1024; // 4 GB
  

    if(!allowedMimeTypesPhoto.concat(allowedMimeTypesVideo).includes(file.mimetype)){
        return cb(new BadRequestException('Unsupported file type'), false);
    }
  

    if(!allowedExtensionPhoto.concat(allowedExtensionsVideo).includes(fileExtension)) {
        return cb(new BadRequestException('Unsupported file extension'), false);
    }
  

    if ((allowedMimeTypesPhoto.includes(file.mimetype) && file.size > maxImageSize) ||
    (allowedMimeTypesVideo.includes(file.mimetype) && file.size > maxVideoSize)){
        return cb(
            new BadRequestException(
                `File size exceeds the limit for ${(allowedMimeTypesVideo.includes(file.mimetype)) ? 'videos' : 'images'}`,
            ),
            false,
        );
    }
  
    cb(null, true); 
  };