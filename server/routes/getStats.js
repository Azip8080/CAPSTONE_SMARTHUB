const getStats = async (req, res) => {
  try {
    const [totalProjects, totalEvents, totalUsers, barangays] = await Promise.all([
      Project.countDocuments(),
      Event.countDocuments(),
      User.countDocuments(),
      Project.distinct("barangay"),
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        totalEvents,
        totalUsers,
        totalBarangays: barangays.length,
      },
    });
  } catch (err) {
    console.error("getStats:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};