import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export const optimizeImage = async (filePath: string): Promise<string> => {
    const fileExt = path.extname(filePath);
    const optimizedPath = filePath.replace(fileExt, '-optimized' + fileExt);

    await sharp(filePath)
        .resize(1024) // Resize width to max 1024px while maintaining aspect ratio
        .jpeg({ quality: 80 }) // Convert to JPEG and reduce quality to 80%
        .toFile(optimizedPath);

    fs.unlinkSync(filePath); // Remove original file after processing

    return optimizedPath; // Return new optimized file path
};