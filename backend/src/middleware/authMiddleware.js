const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // 1️⃣ Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "No token provided" });
        }

        // 2️⃣ Format: "Bearer TOKEN"
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Invalid token format" });
        }

        // 3️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4️⃣ Attach user info to request
        req.user = decoded;

        // 5️⃣ Continue to next function
        next();

    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;
