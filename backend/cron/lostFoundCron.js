const cron = require('node-cron');
const LostFoundItem = require('../models/LostFoundItem');
const cloudinary = require('../config/cloudinary');

// Function to delete images from Cloudinary
const deleteImages = async (images) => {
  if (!images || !Array.isArray(images)) return;
  
  for (const img of images) {
    if (img.public_id) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (error) {
        console.error(`Error deleting image ${img.public_id}:`, error);
      }
    }
  }
};

// Function to perform hard delete
const performHardDelete = async (item) => {
  try {
    // Delete images from Cloudinary
    await deleteImages(item.images);
    
    // Hard delete the item from database
    await LostFoundItem.findByIdAndDelete(item._id);
    
    console.log(`Hard deleted item ${item._id} (${item.type} - ${item.title})`);
  } catch (error) {
    console.error(`Error performing hard delete for item ${item._id}:`, error);
  }
};

// Schedule cron job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    
    // Find items that need to be hard deleted
    // For resolved items: 3 days after resolution
    const resolvedItemsToDelete = await LostFoundItem.find({
      resolved: true,
      resolvedAt: { $exists: true },
      resolvedAt: { $lte: new Date(now - 3 * 24 * 60 * 60 * 1000) },
      isDeleted: true
    });

    // For normal items: 14 days after soft delete
    const normalItemsToDelete = await LostFoundItem.find({
      resolved: false,
      isDeleted: true,
      deletedAt: { $exists: true },
      deletedAt: { $lte: new Date(now - 14 * 24 * 60 * 60 * 1000) }
    });

    // Process resolved items for hard delete
    for (const item of resolvedItemsToDelete) {
      await performHardDelete(item);
    }

    // Process normal items for hard delete
    for (const item of normalItemsToDelete) {
      await performHardDelete(item);
    }

    console.log(`Hard delete cron job completed. Deleted ${resolvedItemsToDelete.length} resolved items and ${normalItemsToDelete.length} normal items.`);
  } catch (error) {
    console.error('Error in hard delete cron job:', error);
  }
});

module.exports = cron; 