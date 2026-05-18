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
        algorithms: ["HS256"],
        issuer: process.env.JWT_ISSUER || "shivtatva",
        audience: process.env.JWT_AUDIENCE || "shivtatva-app",
      });
      req.user = payload;
      if (roles?.length) {
        const role = payload?.role;
        if (!roles.includes(role)) return res.status(403).json({ error: "forbidden" });
      }
      return next();
    } catch {
      return res.status(401).json({
        error: "invalid_token",
        hint:
          "Set JWT_SECRET on Render to the same value as Vercel (apps/web). Redeploy both after changing.",
      });
    }
  };
}

