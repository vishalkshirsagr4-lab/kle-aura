const jwt = require("jsonwebtoken");

// Protects admin-only routes. Expects:  Authorization: Bearer <token>
module.exports = function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Admin login required." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "admin") throw new Error("Not an admin token");
    req.admin = payload;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Session expired. Please log in again." });
  }
};
