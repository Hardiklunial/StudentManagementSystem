const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const axios = require("axios");
const { ROLES } = require("../../../consts");
const rateLimit = require("express-rate-limit")

dotenv.config();

async function fetchJWKS(jku) {
  const response = await axios.get(jku);
  return response.data.keys;
}

function getPublicKeyFromJWKS(kid, keys) {
  const key = keys.find((k) => k.kid === kid);

  if (!key) {
    throw new Error("Unable to find a signing key that matches the 'kid'");
  }

  return `-----BEGIN PUBLIC KEY-----\n${key.n}\n-----END PUBLIC KEY-----`;
}

async function verifyJWTWithJWKS(token) {
  const decodedHeader = jwt.decode(token, { complete: true }).header
  const { kid, alg, jku } = decodedHeader;

  if (!kid || !jku) {
    throw new Error("Invalid JWT header");
  }
  if (alg !== "RS256") {
    throw new Error("Unsupported JWT algorithm");
  }
  const keys = await fetchJWKS(jku);
  const publicKey = getPublicKeyFromJWKS(kid, keys);
  return jwt.verify(token, publicKey, { algorithms: ["RS256"] });
}

// Role-based Access Control Middleware
function verifyRole(requiredRoles) {

  return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token is missing" });
    }

    try{
      const decoded = await verifyJWTWithJWKS(token); //decode the token, verify and get the payload(user info)
      
      req.user = decoded; // Attach the user info to the request object
      
      const userRoles = req.user.payload.role || []; // Assuming the role is stored in the token payload
      
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({ message: "Forbidden: You do not have the required role" });
      }
      next();
    }
    catch (error) {
      return res.status(403).json({ message: "Invalid or expired token", error: error.message });
    }
};
}

function restrictStudentToOwnData(req, res, next) {

  if(req.user.payload.role.includes(ROLES.STUDENT) && req.user.payload.email !== req.params.email) {
    return res.status(403).json({ message: "Forbidden: You can only access your own data" });
  }
  next();
}

const jwtRateLimiter = rateLimit({
  windowMs : 60*1000,
  max: 5,
  message: "Too many requests",
  headers: true,
  keyGenerator:(req) => req.user.id, //use the user id from JWT as the key
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests from this user, please try again later"
    })
  }
});

module.exports = {
  verifyRole,
  restrictStudentToOwnData,
  jwtRateLimiter
};
