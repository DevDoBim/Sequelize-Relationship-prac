const express = require("express");
const jwt = require("jsonwebtoken");
const { Users, UserInfos } = require("../models");

const router = express.Router();

// # 회원가입 API
router.post("/users", async (req, res) => {
  const { email, password, name, age, gender, profileImage } = req.body;
  const isExistUser = await Users.findOne({
    where: {
      email: email,
    },
  });
  // # email 중복 검증
  if (isExistUser) {
    return res
      .status(400)
      .json({ errorMessage: " 이미 존재하는 이메일입니다." });
  }
  // # 사용자 테이블에 데이터 삽입
  const user = await Users.create({ email, password });

  // # 사용자 정보 테이블에 데이터 삽입
  // # 어떤 사용자의 정보인지 확인
  await UserInfos.create({
    UserId: user.userId, // 생성된 user의 userId의 정보이다.
    name,
    age,
    gender,
    profileImage,
  });
  return res.status(201).json({ message: " 회원가입이 완료되었습니다. " });
});

// # 로그인 API
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await Users.findOne({ where: { email } });
  // # 이메일, 비밀번호 검증
  if (!user) {
    return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
  } else if (user.password !== password) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  // # jwt 생성
  const token = jwt.sign(
    //jwt.sign() => jwt 생성
    {
      userId: user.userId, // jwt 할당 {userId : user.userId}
    },
    "customized_secret_key" // 비밀키
  );

  // # 쿠키 발급
  res.cookie("authorization", `Bearer ${token}`); // ("쿠키이름", `토큰형태 ${token}`)
  return res.status(200).json({ message: "로그인 성공" });
});

// #사용자 정보 조회 API
router.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  const user = await Users.findOne({
    attributes: ["userId", "email", "createdAt", "updatedAt"],
    include: [
      {
        model: UserInfos, // 1:1 관계를 맺고있는 UserInfos 테이블을 조회합니다.
        attributes: ["name", "age", "gender", "profileImage"],
      },
    ],
    where: { userId },
  });

  return res.status(200).json({ data: user });
});

module.exports = router;
