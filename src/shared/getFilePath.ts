import path from 'path';
import { optimizeImage } from '../util/imageOptimize';
type IFolderName = 'image' | 'images' | 'proofImage' | 'locationImage' | 'media' | 'doc' | 'profile' | 'imgFront' | 'imgBack' | 'video' | 'pdf' | 'attachment';

// single file
export const getSingleFilePath = async (files: any, folderName: IFolderName) => {
    const fileField = files && files[folderName];
    if (fileField && Array.isArray(fileField) && fileField.length > 0) {
        const originalFilePath = path.join(process.cwd(), 'uploads', folderName, fileField[0].filename);
        const optimizedFilePath = await optimizeImage(originalFilePath);

        const relativePath = optimizedFilePath.replace(path.join(process.cwd(), 'uploads'), '');
        return `${relativePath.replace(/\\/g, '/')}`;
    }
    return undefined;
};

//multiple files
export const getMultipleFilesPath = async (files: any, folderName: IFolderName) => {
    const folderFiles = files && files[folderName];

    if (folderFiles && Array.isArray(folderFiles)) {

        const optimizedPaths = await Promise.all(
            folderFiles.map(async (file: any) => {
                const originalFilePath = path.join(process.cwd(), 'uploads', folderName, file.filename);

                const optimizedFilePath = await optimizeImage(originalFilePath);

                // Convert absolute path to a proper relative path
                const relativePath = optimizedFilePath.replace(path.join(process.cwd(), 'uploads'), '');
                return relativePath;
            })
        );

        return optimizedPaths;
    }

    return undefined;
};

export const getSingleFilePathDocument = (files: any, folderName: IFolderName) => {
  const fileField = files && files[folderName];
  if (fileField && Array.isArray(fileField) && fileField.length > 0) {
    return `/${folderName}/${fileField[0].filename}`;
  }

  return undefined;
};

//multiple files
// export const getMultipleFilesPath = (files: any, folderName: IFolderName) => {
//   const folderFiles = files && files[folderName];
//   if (folderFiles) {
//     if (Array.isArray(folderFiles)) {
//       return folderFiles.map((file: any) => `/${folderName}/${file.filename}`);
//     }
//   }

//   return undefined;
// };