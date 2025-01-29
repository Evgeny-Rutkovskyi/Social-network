import * as sharp from 'sharp';
import { sizeFile } from './sizeFile.util';
import { isPermissibleSize } from './isPermissibleSize';

type subspecies = 'size' | 'square' | 'portrait' | 'landscape';
type typeFile = 'stories' | 'post';

export const checkPhotoSize = async (buffer, type: typeFile, subspecies: subspecies) => {
    const metadata = await sharp(buffer).metadata();
    const {width, height} = metadata;
    if(!width || !height) return false;
    if(isPermissibleSize(width, height, type, subspecies)) return true;
    const newFile = await resizeImage(buffer, 
        sizeFile[type][`${subspecies}PV`].standardWidth,
        sizeFile[type][`${subspecies}PV`].standardHeight
    );
    return newFile;
}


export const resizeImage = async (buffer: Buffer, targetWidth: number, targetHeight: number) => {
    try {
        const newFile = await sharp(buffer)
          .resize({
            width: targetWidth,
            height: targetHeight,
            fit: 'cover',
          })
          .toBuffer();
    
        console.log('Image resized for Instagram standard and saved to buffer.');
        return newFile;
      } catch (error) {
        console.error('Error resizing image:', error);
        throw error;
      }
}