const auth = require("./firebaseAdmin");
const User = require("./models/User");
const check = async (req, res, next) => {
const userKey = req.headers.authorization?.split(" ")[1];
  if (!userKey) {
    return res.status(401).json({
      message: "no key",
    });
  }
  let decode;
  try {
    decode = await auth.verifyIdToken(userKey);
  } catch (error) { 
    return res.status(401).json({ message: "invalid key" });
  }
  if (!decode.email) {
    return res.status(403).json({ message: "AN EMAIL ADDRESS IS REQUIRED" });
  } try {
    let user = await User.findOne({
      firebaseUid: decode.uid,
    });

    if (!user) {
      user = await User.findOne({
        email: decode.email,
      });

      if (user && decode.email_verified && !user.firebaseUid) {
        user.firebaseUid = decode.uid;
        await user.save();
      } else if (user) {
        return res
          .status(403)
          .json({ message: "VERIFY YOUR EMAIL TO CONTINUE" });
      } else {
        user = new User({
          name: decode.name || "User",
          email: decode.email,
          firebaseUid: decode.uid,
          role: "user",
        });
        await user.save();
      }
    }
    req.user = {
      userId: user._id,
      role: user.role
    };
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "SERVER ERROR" });
  }
  next();
};

const adminCheck = (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "superadmin") {
    return res.status(403).json({
      message: "Admin only",
    });
  }
  next();
};

const superadminCheck = (req, res, next) => {
  if (req.user?.role !== "superadmin") {
    return res.status(403).json({
      message: "Super Admin only",
    });
  }
  next();
};
module.exports = { check, admin: adminCheck, superadmin: superadminCheck };