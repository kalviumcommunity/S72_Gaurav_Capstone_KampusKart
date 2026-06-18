router.get(
 "/recommended",
 authMiddleware,
 getRecommendedEvents
);

app.use("/api/recommendations", recommendationRoutes);