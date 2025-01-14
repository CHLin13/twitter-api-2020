const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')

const helpers = require('../_helpers')
const { sequelize } = require('../models')
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply

const imgur = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUP: (req, res) => {
    const { account, name, email, password, checkPassword } = req.body
    if (!account || !name || !email || !password || !checkPassword) {
      return res.json({ status: 'error', message: '所有欄位都是必填' })
    }
    if (password !== checkPassword) {
      return res.json({ status: 'error', message: '兩次密碼輸入不同' })
    }
    if (account.length > 20 || name.length > 50 || password.length > 20) {
      return res.json({ status: 'error', message: '超過字數上限' })
    }
    User.findOne({ where: { [Op.or]: [{ email }, { account }] } })
      .then(user => {
        if (user) {
          return res.json({ status: 'error', message: 'Email或帳號重複' })
        }
        User.create({
          account,
          name,
          email,
          introduction: '',
          avatar: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg',
          cover: 'https://i.imgur.com/CVo4HhZ.jpg',
          password: bcrypt.hashSync(req.body.password, 10)
        })
          .then(() => {
            return res.json({ status: 'success', message: '成功註冊帳號' })
          })
      })
  },

  signIn: (req, res) => {
    const { account, password } = req.body
    if (!account || !password) {
      return res.json({ status: 'error', message: "所有欄位都是必填" })
    }

    return User.findOne({
      where: {
        [Op.or]: [
          { account },
          { email: account }
        ]
      }
    }).then(user => {
      if (!user) {
        return res.json({ status: 'error', message: "帳號不存在" })
      }
      if (user.role !== 'user') {
        return res.json({ status: 'error', message: "帳號不存在" })
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return res.json({ status: 'error', message: "密碼錯誤" })
      }

      const payload = { id: user.id }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      return res.json({
        status: 'success',
        message: '登入成功',
        token: token,
        user: { id: user.id, account: user.account, name: user.name, email: user.email, avatar: user.avatar, cover: user.cover, introduction: user.introduction, role: user.role }
      })
    })
  },

  getTweets: (req, res) => {
    Tweet.findAll({
      where: { UserId: req.params.id },
      attributes: [
        'id',
        'UserId',
        'description',
        'createdAt',
        'updatedAt'
      ],
      include: [User, Reply, Like],
      order: [['createdAt', 'DESC']],
    }).then(tweets => {
      tweets = tweets.map(tweet => ({
        ...tweet.dataValues,
        likeCount: tweet.Likes.length,
        replyCount: tweet.Replies.length,
        isLiked: tweet.Likes.map(u => u.UserId).includes(req.user.id)
      }))
      return res.json(tweets)
    })
  },

  getUser: (req, res) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' }
      ]
    })
      .then(user => {
        if (!user || user.role === 'admin') {
          return res.json({ status: 'error', message: '權限錯誤' })
        }
        user.dataValues.isFollowed = (user.Followers.map(u => u.id).includes(req.user.id))
        return res.json(user)
      })
  },

  getRepliedTweets: (req, res) => {
    return Reply.findAll({
      include: [User, { model: Tweet, include: [{ model: User, attributes: ['name', 'account'] }] }],
      where: { UserId: req.params.id }
    }).then(replies => {
      return res.json(replies)
    })
  },

  getLikes: (req, res) => {
    Like.findAll({
      where: { UserId: req.params.id },
      include: [
        {
          model: Tweet,
          include: [{ model: User },
            Reply,
            Like,
          ],
          attributes: [
            'id',
            'UserId',
            'description',
            'createdAt',
            'updatedAt',
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    }).then(likes => {
      likes = likes.map(like => ({
        ...like.dataValues,
        likeTweetCount: like.Tweet.Likes.length,
        replyTweetCount: like.Tweet.Replies.length,
        isLiked: like.Tweet.Likes.map(u => u.UserId).includes(req.user.id),
        userAvatar: like.Tweet.User.avatar,
        userName: like.Tweet.User.name,
        userAccount: like.Tweet.User.account,
      }))
      return res.json(likes)
    })
  },

  putUser: async (req, res) => {
    const { name, introduction } = req.body
    if (req.params.id !== String(helpers.getUser(req).id)) {
      return res.json({ status: 'error', message: "權限錯誤" })
    }
    if (name && name.length > 50) {
      return res.json({ status: 'error', message: '名稱字數最多 50 字' })
    }
    if (introduction && introduction.length > 160) {
      return res.json({ status: 'error', message: '自我介紹字數最多 160 字' })
    }
    const { files } = req
    imgur.setClientId(IMGUR_CLIENT_ID)
    if (files) {
      if (files.avatar) {
        const avatar = await imgur.uploadFile(files.avatar[0].path)
        req.body.avatar = avatar.link
      }
      if (files.cover) {
        const cover = await imgur.uploadFile(files.cover[0].path)
        req.body.cover = cover.link
      }
    }

    await User.update({ ...req.body }, { where: { id: req.params.id } })

    return res.json({ status: 'success', message: '資料編輯成功' })
  },

  editUser: (req, res) => {
    const { account, name, email, password, checkPassword } = req.body
    if (req.params.id !== String(req.user.id)) {
      return res.json({ status: 'error', message: "權限錯誤" })
    }
    if (!account || !name || !email || !password || !checkPassword) {
      return res.json({ status: 'error', message: '所有欄位都是必填' })
    }
    if (password !== checkPassword) {
      return res.json({ status: 'error', message: '密碼與確認密碼不相符' })
    }
    if (account.length > 20 || password.length > 20 || name.length > 50) {
      return res.json({ status: 'error', message: '超過字數上限' })
    }
    return Promise.all([
      User.findByPk(req.params.id),
      User.findOne({ where: { email } }),
      User.findOne({ where: { account } })
    ])
      .then(([user, anotherUserE, anotherUserA]) => {
        if (anotherUserE && anotherUserE.email !== user.email) {
          return res.json({ status: 'error', message: '不能使用此email' })
        }
        if (anotherUserA && anotherUserA.account !== user.account) {
          return res.json({ status: 'error', message: '不能使用此帳號' })
        }
        user.update({
          account,
          name,
          email,
          password: bcrypt.hashSync(password, 10)
        })
          .then(() => {
            return res.json({ status: 'success', message: '資料編輯成功' })
          })
      })
  },

  getCurrentUser: (req, res) => {
    return User.findByPk(req.user.id)
      .then(user => {
        return res.json(user)
      })
  },

  getFollowers: (req, res) => {
    return User.findByPk(req.params.id,
      {
        include: [{
          model: User, as: 'Followers',
          attributes: [['id', 'followerId'],
            'name',
            'account',
            'avatar',
            'cover',
            'introduction'
          ]
        }
        ],
        attributes: [
          'id',
          'name',
          'account',
          'avatar',
          'cover'
        ]
      }).then(followers => {
        followers.Followers = followers.Followers.map(follower => ({
          ...follower.dataValues,
          isFollowed: helpers.getUser(req).Followings.map(f => f.id).includes(follower.dataValues.followerId)
        }))
        return res.json(followers.Followers)
      })
  },

  getFollowings: (req, res) => {
    return User.findByPk(req.params.id,
      {
        include: [{
          model: User, as: 'Followings',
          attributes: [['id', 'followingId'],
            'name',
            'account',
            'avatar',
            'cover',
            'introduction'
          ]
        }],
        attributes: [
          'id',
          'name',
          'account',
          'avatar',
          'cover'
        ]
      }).then(followings => {
        followings.Followings = followings.Followings.map(following => ({
          ...following.dataValues,
          isFollowed: helpers.getUser(req).Followings.map(f => f.id).includes(following.dataValues.followingId)
        }))
        return res.json(followings.Followings)
      })
  },

  getTopUsers: (req, res) => {
    return User.findAll({
      include: { model: User, as: 'Followers' },
      attributes: [
        'id',
        'name',
        'avatar',
        'account',
        'role',
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM Followships WHERE Followships.followingId = User.id)'
          ),
          'followersCount'
        ]
      ],
      order: [[sequelize.literal('followersCount'), 'DESC']],
      limit: 10
    })
      .then(users => {
        users = users.filter(user => (
          !user.role.includes('admin')
        ))
        users = users.map(user => ({
          ...user.dataValues,
          isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
        }))
        return res.json(users)
      })
  }
}



module.exports = userController