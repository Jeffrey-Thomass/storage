import e from "express";
import User from "../models/userModel.js";
import crypto from "node:crypto";



export default async function checkAuth(req, res, next) {
  console.log(req.signedCookies)
  console.log("_-----_")
  const { token } = req.signedCookies;
  if (!token) {
    res.clearCookie("token");
    return res.status(401).json({ error: "Not logged in!" });
  }

  const{id , expiry : expiryTimeInSeconds} = JSON.parse(token); 

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
