const cron = require('node-cron');
const LostFoundItem = require('../models/LostFoundItem');
const Complaint = require('../models/Complaint');
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
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(now.getDate() - 14);
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        console.log('Starting automatic deletion of expired complaints and lost & found items...');

        // ===== LOST & FOUND ITEMS =====
        
        // Find resolved items older than 14 days (to be soft deleted)
        const resolvedExpiredItems = await LostFoundItem.find({
            resolved: true,
            resolvedAt: { $lt: fourteenDaysAgo },
            isDeleted: { $ne: true }
        });

        console.log(`Found ${resolvedExpiredItems.length} resolved lost & found items to delete.`);

        // Soft delete resolved items
        for (const item of resolvedExpiredItems) {
            try {
                // Delete images from Cloudinary
                await deleteImages(item.images);
                
                item.isDeleted = true;
                item.deletedAt = new Date();
                await item.save();
                console.log(`Soft-deleted resolved lost & found item: ${item._id}`);
            } catch (error) {
                console.error(`Error soft-deleting lost & found item ${item._id}:`, error);
            }
        }

        // ===== COMPLAINTS =====
        
        // Find resolved/closed complaints older than 14 days (to be soft deleted)
        const resolvedExpiredComplaints = await Complaint.find({
            status: { $in: ['Resolved', 'Closed'] },
            lastUpdated: { $lt: fourteenDaysAgo },
            isDeleted: { $ne: true }
        });

        console.log(`Found ${resolvedExpiredComplaints.length} resolved/closed complaints to delete.`);

        // Soft delete resolved/closed complaints
        for (const complaint of resolvedExpiredComplaints) {
            try {
                // Delete images from Cloudinary
                if (Array.isArray(complaint.images)) {
                    for (const img of complaint.images) {
                        try {
                            await cloudinary.uploader.destroy(img.public_id);
                        } catch (err) {
                            console.error(`Error deleting complaint image ${img.public_id}:`, err);
                        }
                    }
                }
                
                complaint.isDeleted = true;
                complaint.deletedAt = new Date();
                await complaint.save();
                console.log(`Soft-deleted resolved/closed complaint: ${complaint._id}`);
            } catch (error) {
                console.error(`Error soft-deleting complaint ${complaint._id}:`, error);
            }
        }

        // ===== HARD DELETE OLD SOFT-DELETED ITEMS =====
        
        // Hard delete lost & found items that have been soft-deleted for more than 7 days
        const itemsToHardDelete = await LostFoundItem.find({
            isDeleted: true,
            deletedAt: { $lt: sevenDaysAgo }
        });
        for (const item of itemsToHardDelete) {
            try {
                await deleteImages(item.images);
                await LostFoundItem.deleteOne({ _id: item._id });
                console.log(`Hard-deleted lost & found item: ${item._id}`);
            } catch (error) {
                console.error(`Error hard-deleting lost & found item ${item._id}:`, error);
            }
        }

        // Hard delete complaints that have been soft-deleted for more than 7 days
        const complaintsToHardDelete = await Complaint.find({
            isDeleted: true,
            deletedAt: { $lt: sevenDaysAgo }
        });
        for (const complaint of complaintsToHardDelete) {
            try {
                // Delete images from Cloudinary
                if (Array.isArray(complaint.images)) {
                    for (const img of complaint.images) {
                        try {
                            await cloudinary.uploader.destroy(img.public_id);
                        } catch (err) {
                            console.error(`Error deleting complaint image ${img.public_id}:`, err);
                        }
                    }
                }
                await Complaint.deleteOne({ _id: complaint._id });
                console.log(`Hard-deleted complaint: ${complaint._id}`);
            } catch (error) {
                console.error(`Error hard-deleting complaint ${complaint._id}:`, error);
            }
        }

        console.log('Finished automatic deletion of expired complaints and lost & found items.');
    } catch (error) {
        console.error('Error in deleteExpiredItems:', error);
    }
};

// Schedule the cron job to run every day at midnight
const startDeletionCronJob = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('Running scheduled deletion of expired complaints and lost & found items...');
        await deleteExpiredItems();
    });
    console.log('Scheduled deletion of expired complaints and lost & found items is active.');
};

module.exports = startDeletionCronJob; 