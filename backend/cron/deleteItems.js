const cron = require('node-cron');
const LostFoundItem = require('../models/LostFoundItem');
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration (ensure this is configured in your main server file or here)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteExpiredItems = async () => {
    try {
        const now = new Date();
        const fifteenDaysAgo = new Date(now);
        fifteenDaysAgo.setDate(now.getDate() - 15);
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

        // Find unresolved items older than 15 days
        const unresolvedExpiredItems = await LostFoundItem.find({
            resolved: false,
            createdAt: { $lt: fifteenDaysAgo }
        });

        // Find resolved items older than 24 hours
        const resolvedExpiredItems = await LostFoundItem.find({
            resolved: true,
            resolvedAt: { $lt: twentyFourHoursAgo }
        });

        const itemsToDelete = [...unresolvedExpiredItems, ...resolvedExpiredItems];

        if (itemsToDelete.length > 0) {
            console.log(`Found ${itemsToDelete.length} expired items to delete.`);

            for (const item of itemsToDelete) {
                try {
                    // Remove images from Cloudinary
                    if (item.images && item.images.length > 0) {
                        for (const image of item.images) {
                            try {
                                await cloudinary.uploader.destroy(image.public_id);
                            } catch (cloudinaryError) {
                                console.error(`Error deleting image ${image.public_id} from Cloudinary:`, cloudinaryError);
                                // Continue with item deletion even if image deletion fails
                            }
                        }
                    }
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
        console.error('Error in scheduled item deletion task:', error);
    }
};

// Schedule the task to run once every day at midnight
const startDeletionCronJob = () => {
    cron.schedule('0 0 * * *', () => {
        console.log('Running scheduled item deletion task...');
        deleteExpiredItems();
    });
    console.log('Scheduled item deletion cron job to run daily at midnight.');
};

module.exports = startDeletionCronJob; 