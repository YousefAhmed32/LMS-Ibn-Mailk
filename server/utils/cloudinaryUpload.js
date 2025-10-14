const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
     cloud_name: 'dfzgiebus', 
        api_key: '942859652132982', 
        api_secret: 'He_kzvl3i9I5cflvtltS8xj1SS8'
});

const storage = multer.memoryStorage();

async function ImageUploadUtil(file) {
    const result = await cloudinary.uploader.upload(file, {
        resource_type: 'auto',
    });
    return result;
}

async function uploadToCloudinary(file) {
    try {
        let uploadResult;
        
        if (Buffer.isBuffer(file)) {
            // If it's a buffer (from multer memory storage), convert to data URI
            const base64 = file.toString('base64');
            const dataURI = `data:image/jpeg;base64,${base64}`;
            uploadResult = await cloudinary.uploader.upload(dataURI, {
                resource_type: 'auto',
            });
        } else {
            // If it's a file path (from multer disk storage)
            uploadResult = await cloudinary.uploader.upload(file, {
                resource_type: 'auto',
            });
        }
        
        return uploadResult;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}

async function deleteFromCloudinary(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
}

const upload = multer({ storage });

module.exports = {
    ImageUploadUtil,
    uploadToCloudinary,
    deleteFromCloudinary,
    upload
};
