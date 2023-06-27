// # 사용자 인증 미들웨어
const jwt = require("jsonwebtoken");
const { Users } = require("../models");

module.exports = async (req, res, nex) => {
  const { authorization } = req.cookies;
  const [tokenType, token] = authorization.split(" ");

  if (tokenType !== "Bearer" || !token) {
    return res.status(401).json({
      errorMessage: "토근 타입이 일치하지 않거나, 토큰이 존재하지 않습니다.",
    });
  }
  try {
    // jwt.verify => decode (decode대상, 비밀키) 검증
    // jwt를 생성할 때 userId를 할당 했기에 jwt안에 userId가 저장되어 있어 할당한 것.
    const decodedToken = jwt.verify(token, "customized_secret_key");
    const userId = decodedToken.userId;

    const user = await Users.findOne({ where: { userId } });
    // 전달받은 userId를 통해 사용자가 존재하지 않을 때
    if (!user) {
      return res
        .status(401)
        .json({ message: "토큰에 해당하는 사용자가 존재하지 않습니다." });
    }
    res.locals.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ errorMessage: "비정상적인 접근입니다." });
  }
};
