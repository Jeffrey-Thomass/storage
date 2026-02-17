import User from "../models/userModel.js";

export default async function checkAuth(req, res, next) {
  const { uid } = req.cookies;
  if (!uid) {
    return res.status(401).json({ error: "Not logged!" });
  }
  const expiryTimeInSeconds = parseInt(uid.substr(24,32), 16);
  const currentTimeInSeconds = Math.round(Date.now() / 1000);
  console.log(expiryTimeInSeconds, currentTimeInSeconds);
  console.log(expiryTimeInSeconds - currentTimeInSeconds);

  if(currentTimeInSeconds > expiryTimeInSeconds) {
    res.clearCookie("uid");
    return res.status(401).json({ error: "Not logged!" });
  }
  const user = await User.findOne({ _id: uid.substr(0, 24) }).lean();
  if (!user) {
    return res.status(401).json({ error: "Not logged!" });
  }
  req.user = user;
  next();
}
