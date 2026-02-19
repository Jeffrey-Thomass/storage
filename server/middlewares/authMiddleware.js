import e from "express";
import User from "../models/userModel.js";
import crypto from "node:crypto";

const secret = "HELLOWORLD_!123"

export default async function checkAuth(req, res, next) {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: "Not logged!" });
  }

  const [payload , oldSignature] = token.split(".");

  const jsonPayload = Buffer.from(payload, "base64url").toString();

  const newSignature = crypto.createHash('sha256').update(jsonPayload).update(secret).digest('base64url');

  console.log(oldSignature, newSignature);

  if(oldSignature !== newSignature) {
    res.clearCookie("token");
    return res.status(401).json({ error: "Not logged in!" });
  }

  const{id , expiry : expiryTimeInSeconds} = JSON.parse(Buffer.from(payload, "base64url").toString()); 

  // const expiryTimeInSeconds = parseInt(token.substr(24,32), 16);
  const currentTimeInSeconds = Math.round(Date.now() / 1000);

  if(currentTimeInSeconds > expiryTimeInSeconds) {
    res.clearCookie("token");
    return res.status(401).json({ error: "Not logged!" });
  }
  const user = await User.findOne({ _id: id }).lean();
  if (!user) {
    return res.status(401).json({ error: "Not logged!" });
  }
  req.user = user;
  next();
}
