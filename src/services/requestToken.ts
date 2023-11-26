import jwt from "jsonwebtoken";
export const generateToken = (payload) => {
  const token = jwt.sign(payload, "nampg", { expiresIn: "10h" });
  return token;
};
