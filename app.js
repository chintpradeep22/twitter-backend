const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require("cors");

const app = express()

const dbPath = path.join(__dirname, 'twitterClone.db')

let db = null

app.use(cors());

app.use(express.json())

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running on port 3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const authenticateToken = (request, response, next) => {
  let jwtToken
  const authHeader = request.headers['authorization']
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1]
  }
  if (jwtToken === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.status(401)
        response.send('Invalid JWT Token')
      } else {
        request.userId = payload.userId
        next()
      }
    })
  }
}

//API1

app.post('/register/', async (request, response) => {
  const {username, password, name, gender} = request.body
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
    if (password.length < 6) {
      return response.status(400).send('Password is too short')
    } else {
      const hassedPassword = await bcrypt.hash(password, 10)
      const registerQuery = `INSERT INTO user (username, password, name, gender) VALUES ('${username}', '${hassedPassword}','${name}','${gender}');`
      const dbResponse = await db.run(registerQuery)
      return response.send('User created successfully')
    }
  } else {
    return response.status(400).send('User already exists')
  }
})

//API2

app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)
    if (isPasswordMatched === true) {
      const payload = {
        userId: dbUser.user_id,
      }
      const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN')
      response.send({jwtToken})
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

//API3

app.get('/user/tweets/feed/', authenticateToken, async (request, response) => {
  const userId = request.userId
  const getTweetsQuery = `
    SELECT username, tweet, date_time AS dateTime 
    FROM follower 
    INNER JOIN tweet ON follower.following_user_id = tweet.user_id 
    INNER JOIN user ON tweet.user_id = user.user_id 
    WHERE follower.follower_user_id = '${userId}'
    ORDER BY date_time DESC 
    LIMIT 4;`
  const dbResponse = await db.all(getTweetsQuery)
  response.send(dbResponse)
})

//API4

app.get('/user/following/', authenticateToken, async (request, response) => {
  const userId = request.userId
  const getUserNamesQuery = `
    SELECT name FROM follower INNER JOIN user ON follower.following_user_id == user.user_id WHERE follower.follower_user_id = ${userId};`
  const dbResponse = await db.all(getUserNamesQuery)
  response.send(dbResponse)
})

//API5

app.get('/user/followers/', authenticateToken, async (request, response) => {
  const userId = request.userId
  const getUserNamesQuery = `
    SELECT name FROM follower INNER JOIN user ON follower.follower_user_id == user.user_id WHERE follower.following_user_id = ${userId};`
  const dbResponse = await db.all(getUserNamesQuery)
  response.send(dbResponse)
})

//API6

app.get('/tweets/:tweetId/', authenticateToken, async (request, response) => {
  const {tweetId} = request.params
  const userId = request.userId
  const accessQuery = `
  SELECT * FROM follower INNER JOIN tweet ON follower.following_user_id == tweet.user_id WHERE follower.follower_user_id = '${userId}' AND tweet.tweet_id = '${tweetId}';`
  const accessTweet = await db.get(accessQuery)
  if (accessTweet === undefined) {
    response.status(401)
    response.send('Invalid Request')
  } else {
    const getTweetsQuery = `
    SELECT tweet,
    (SELECT COUNT(*) FROM like WHERE tweet_id = '${tweetId}') AS likes,
    (SELECT COUNT(*) FROM reply WHERE tweet_id = '${tweetId}') AS replies,
    date_time AS dateTime
    FROM tweet
    where tweet_id = ${tweetId};`
    const tweetDetails = await db.get(getTweetsQuery)
    response.send(tweetDetails)
  }
})

//API7

app.get(
  '/tweets/:tweetId/likes/',
  authenticateToken,
  async (request, response) => {
    const {tweetId} = request.params
    const userId = request.userId

    const checkUserTweet = `SELECT * FROM follower INNER JOIN tweet ON follower.following_user_id == tweet.user_id WHERE follower.follower_user_id = '${userId}' AND tweet.tweet_id = '${tweetId}';`
    const accessTweet = await db.get(checkUserTweet)
    if (accessTweet === undefined) {
      response.status(401)
      response.send('Invalid Request')
    } else {
      const getTweetReplysQuery = `
      SELECT user.username
      FROM like INNER JOIN user ON like.user_id == user.user_id WHERE like.tweet_id = '${tweetId}';`
      const likes = await db.all(getTweetReplysQuery)
      const usernames = likes.map(like => like.username)
      response.send({likes: usernames})
    }
  },
)

//API8

app.get(
  '/tweets/:tweetId/replies/',
  authenticateToken,
  async (request, response) => {
    const {tweetId} = request.params
    const userId = request.userId

    const checkUserTweet = `SELECT * FROM follower INNER JOIN tweet ON follower.following_user_id == tweet.user_id WHERE follower.follower_user_id = '${userId}' AND tweet.tweet_id = '${tweetId}';`
    const accessTweet = await db.get(checkUserTweet)
    if (accessTweet === undefined) {
      response.status(401)
      response.send('Invalid Request')
    } else {
      const getTweetReplysQuery = `
  SELECT user.name AS name, reply.reply AS reply
  FROM reply INNER JOIN user ON reply.user_id == user.user_id WHERE reply.tweet_id = '${tweetId}';`
      const replies = await db.all(getTweetReplysQuery)
      response.send({replies})
    }
  },
)

//API9

app.get('/user/tweets/', authenticateToken, async (request, response) => {
  const userId = request.userId
  const getTweetsQuery = `
    SELECT 
      tweet, 
      (SELECT COUNT(*) FROM like WHERE tweet_id = tweet.tweet_id) AS likes, 
      (SELECT COUNT(*) FROM reply WHERE tweet_id = tweet.tweet_id) AS replies, 
      date_time AS dateTime 
    FROM tweet 
    WHERE user_id = ${userId};`
  const tweetDetails = await db.all(getTweetsQuery)
  response.send(tweetDetails)
})

//API10

app.post('/user/tweets/', authenticateToken, async (request, response) => {
  const userId = request.userId
  const {tweet} = request.body
  const createTweetQuery = `
  INSERT INTO tweet (tweet,user_id) VALUES ('${tweet}','${userId}');`
  await db.run(createTweetQuery)
  response.send('Created a Tweet')
})

//API11

app.delete(
  '/tweets/:tweetId/',
  authenticateToken,
  async (request, response) => {
    const userId = request.userId
    const {tweetId} = request.params
    const checkUserTweetQuery = `
  SELECT * FROM tweet WHERE tweet_id = '${tweetId}' AND user_id = '${userId}';`
    const checkUserTweet = await db.get(checkUserTweetQuery)
    if (checkUserTweet === undefined) {
      return response.status(401).send('Invalid Request')
    } else {
      const deleteUserTweetQuery = `
    DELETE FROM tweet WHERE tweet_id = '${tweetId}';`
      await db.run(deleteUserTweetQuery)
      response.send('Tweet Removed')
    }
  },
)

module.exports = app
