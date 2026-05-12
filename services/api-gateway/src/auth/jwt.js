import jwt from "jsonwebtoken";

export function requireAuth(options = {}) {
  const { roles } = options; // optional: ["admin", "employee"]
  return (req, res, next) => {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "missing_token" });

    try {
      const secret = process.env.JWT_SECRET || "dev_secret";
      const payload = jwt.verify(token, secret, {
        issuer: process.env.JWT_ISSUER || undefined,
        audience: process.env.JWT_AUDIENCE || undefined,
      });
      req.user = payload;
      if (roles?.length) {
        const role = payload?.role;
        if (!roles.includes(role)) return res.status(403).json({ error: "forbidden" });
      }
      return next();
    } catch (e) {
      return res.status(401).json({ error: "invalid_token" });
    }
  };
}

