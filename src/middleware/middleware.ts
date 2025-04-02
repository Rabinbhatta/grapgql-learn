import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const tokenGenerator = ({
  id,
  name,
  email,
}: {
  id: String;
  name: String;
  email: String;
}) => {
  const token = jwt.sign(
    {
      id: id,
      email: email,
      name: name,
    },
    (process.env.JWT_SECRET as string) || "SECRETE",
    { expiresIn: "1h" }
  );
  return token;
};

export const tokenVerifier = (token: string) => {
  try {
    const decoded = jwt.verify(
      token,
      (process.env.JWT_SECRET as string) || "SECRETE"
    );
    return decoded;
  } catch (error) {
    return null;
  }
};

export const authorize = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  console.log(token);
  next();
};
