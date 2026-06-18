export const getRecommendedEvents = async (req, res) => {

 const user = await User.findById(req.user.id);

 const events = await Event.find({
   category: {
      $in: user.interests
   }
 });

 res.json(events);
};
