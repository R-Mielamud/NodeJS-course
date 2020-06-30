exports.adminRequired = (req, res, next) => {
    if (req.user.role === "admin") {
        return next();
    }

    res.status(403).json({ message: "No admin rights", status: 403, error: true });
};

exports.userRequired = (req, res, next) => {
    if (req.user) {
        return next();
    }

    res.status(401).json({ message: "Unauthorized user", status: 401, error: true });
};