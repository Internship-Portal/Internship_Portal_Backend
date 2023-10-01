import jwt from "jsonwebtoken";
require("dotenv").config();

interface userData {
  id: string;
}

// Function to generate a token
export const generateToken = (userData: userData): string | null => {
  const secretKey = process.env.jsonSecretKey ?? "";
  try {
    const token = jwt.sign(userData, secretKey, { expiresIn: "1w" }); // Token expires in 1 week (you can change this as needed)
    return token;
  } catch (e) {
    return null;
  }
};

// Function to verify a token
export const verifyToken = (token: string): userData | string => {
  try {
    const secretKey = process.env.jsonSecretKey ?? "";
    const decoded = jwt.verify(token, secretKey) as userData;
    return decoded;
  } catch (e) {
    return "Invalid Token";
  }
};
