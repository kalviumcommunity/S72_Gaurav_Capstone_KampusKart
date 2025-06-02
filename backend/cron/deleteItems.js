const cron = require('node-cron');
const LostFoundItem = require('../models/LostFoundItem');
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to delete images from Cloudinary
const deleteImages = async (images) => {
    if (!images || !Array.isArray(images)) return;
    
    const deletePromises = images.map(image => {
        return new Promise((resolve) => {
            if (!image || !image.public_id) {
                resolve();
                return;
            }
            cloudinary.uploader.destroy(image.public_id)
                .then(() => resolve())
                .catch(error => {
                    console.error(`Error deleting image ${image.public_id}:`, error);
                    resolve(); // Resolve anyway to continue with other operations
                });
        });
    });
    
    await Promise.all(deletePromises);
};

const deleteExpiredItems = async () => {
    try {
        const now = new Date();
        const fifteenDaysAgo = new Date(now);
        fifteenDaysAgo.setDate(now.getDate() - 15);
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(now.getDate() - 3);

        // Find unresolved items older than 15 days
        const unresolvedExpiredItems = await LostFoundItem.find({
            resolved: false,
            createdAt: { $lt: fifteenDaysAgo }
        });

        // Find resolved items older than 3 days
        const resolvedExpiredItems = await LostFoundItem.find({
            resolved: true,
            resolvedAt: { $lt: threeDaysAgo }
        });

        const itemsToDelete = [...unresolvedExpiredItems, ...resolvedExpiredItems];

        if (itemsToDelete.length > 0) {
            console.log(`Found ${itemsToDelete.length} expired items to delete.`);

            for (const item of itemsToDelete) {
                try {
                    // Remove images from Cloudinary
                    await deleteImages(item.images);
                    
                    // Delete item from database
                    await LostFoundItem.deleteOne({ _id: item._id });
                    console.log(`Deleted item: ${item._id}`);
                } catch (error) {
                    console.error(`Error deleting item ${item._id}:`, error);
                }
            }
            console.log('Finished deleting expired items.');
        }
    } catch (error) {
        console.error('Error in deleteExpiredItems:', error);
    }
};

// Schedule the cron job to run every day at midnight
const startDeletionCronJob = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('Running scheduled deletion of expired items...');
        await deleteExpiredItems();
    });
    console.log('Scheduled deletion of expired items is active.');
};

module.exports = startDeletionCronJob; 