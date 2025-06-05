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

const sendExpirationNotification = async (item) => {
    // TODO: Replace with actual email logic
    console.log(`Notify user ${item.user} about expiring item ${item._id}`);
    item.expirationNotified = true;
    await item.save();
};

const deleteExpiredItems = async () => {
    try {
        const now = new Date();
        const fifteenDaysAgo = new Date(now);
        fifteenDaysAgo.setDate(now.getDate() - 15);
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(now.getDate() - 3);
        const oneDayAhead = new Date(now);
        oneDayAhead.setDate(now.getDate() + 1);
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        // Find unresolved items older than 15 days (to be soft deleted)
        const unresolvedExpiredItems = await LostFoundItem.find({
            resolved: false,
            createdAt: { $lt: fifteenDaysAgo },
            isDeleted: { $ne: true }
        });

        // Find resolved items older than 3 days (to be soft deleted)
        const resolvedExpiredItems = await LostFoundItem.find({
            resolved: true,
            resolvedAt: { $lt: threeDaysAgo },
            isDeleted: { $ne: true }
        });

        // Find items that are about to expire in 1 day and not notified
        const soonToExpire = await LostFoundItem.find({
            isDeleted: { $ne: true },
            expirationNotified: false,
            $or: [
                { resolved: false, createdAt: { $lt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) } },
                { resolved: true, resolvedAt: { $lt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) } }
            ]
        });
        for (const item of soonToExpire) {
            try {
                await sendExpirationNotification(item);
            } catch (err) {
                console.error(`Error sending expiration notification for item ${item._id}:`, err);
            }
        }

        const itemsToSoftDelete = [...unresolvedExpiredItems, ...resolvedExpiredItems];
        if (itemsToSoftDelete.length > 0) {
            console.log(`Found ${itemsToSoftDelete.length} expired items to soft delete.`);
            for (const item of itemsToSoftDelete) {
                try {
                    item.isDeleted = true;
                    item.deletedAt = new Date();
                    await item.save();
                    console.log(`Soft-deleted item: ${item._id}`);
                } catch (error) {
                    console.error(`Error soft-deleting item ${item._id}:`, error);
                }
            }
            console.log('Finished soft-deleting expired items.');
        }

        // Hard delete items that have been soft-deleted for more than 7 days
        const itemsToHardDelete = await LostFoundItem.find({
            isDeleted: true,
            deletedAt: { $lt: sevenDaysAgo }
        });
        for (const item of itemsToHardDelete) {
            try {
                await deleteImages(item.images);
                await LostFoundItem.deleteOne({ _id: item._id });
                console.log(`Hard-deleted item: ${item._id}`);
            } catch (error) {
                console.error(`Error hard-deleting item ${item._id}:`, error);
            }
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