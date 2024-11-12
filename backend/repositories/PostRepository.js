const { sql, connectToDB } = require('../dbConfig');

const PostRepository = {

  async getFeedPosts(userId, limit, offset) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .input('Limit', sql.Int, limit)
      .input('Offset', sql.Int, offset)
      .query(`
        SELECT 
          P.PostId,
          M.MediaUrl,
          P.Caption,
          P.Location,
          P.Date,
          U.UserId,
          U.Nickname,
          U.ProfileImageUrl
        FROM Post P
        JOIN PostMedia PM ON P.PostId = PM.PostId
        JOIN Media M ON PM.MediaId = M.MediaId
        JOIN [User] U ON P.UserId = U.UserId
        WHERE P.UserId IN (
          SELECT FollowedId FROM UserFollows WHERE FollowerId = @UserId
        )
        ORDER BY P.Date DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
      `);
    return result.recordset;
  },

  async getFeedPostCount(userId) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT COUNT(*) AS totalCount
        FROM Post P
        WHERE P.UserId IN (
          SELECT FollowedId FROM UserFollows WHERE FollowerId = @UserId
        )
      `);
    return result.recordset[0].totalCount;
  },

  async createPost({ postId, userId, caption, location }) {
    const pool = await connectToDB();
    await pool.request()
      .input('PostId', sql.UniqueIdentifier, postId)
      .input('UserId', sql.UniqueIdentifier, userId)
      .input('Caption', sql.NVarChar(255), caption)
      .input('Location', sql.NVarChar(255), location)
      .query(`
        INSERT INTO Post (PostId, UserId, Caption, Location)
        VALUES (@PostId, @UserId, @Caption, @Location)
      `);
  },

  async getPostById(postId) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('PostId', sql.UniqueIdentifier, postId)
      .query(`
        SELECT 
          p.PostId,
          p.Caption,
          p.Location,
          p.Date,
          p.UserId,
          u.nickname AS AuthorNickname,
          u.ProfileImageUrl AS ProfileImageUrl
        FROM Post p
        JOIN [User] u ON p.UserId = u.UserId
        WHERE p.PostId = @PostId
      `);
    return result.recordset[0];
  },

  async deletePost(postId, userId) {
    const pool = await connectToDB();
    await pool.request()
      .input('PostId', sql.UniqueIdentifier, postId)
      .input('UserId', sql.UniqueIdentifier, userId)
      .query(`DELETE FROM Post WHERE PostId = @PostId AND UserId = @UserId`);
  },

  async getPostsByUser(userId, limit, offset) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .input('Limit', sql.Int, limit)
      .input('Offset', sql.Int, offset)
      .query(`
        SELECT 
          P.PostId,
          P.Caption,
          P.Location,
          P.Date,
          P.UserId,
          U.Nickname,
          U.ProfileImageUrl,
          M.MediaUrl
        FROM 
          Post P
        LEFT JOIN 
          PostMedia PM ON P.PostId = PM.PostId
        LEFT JOIN 
          Media M ON PM.MediaId = M.MediaId
        LEFT JOIN 
          [User] U ON P.UserId = U.UserId
        WHERE 
          P.UserId = @UserId
        ORDER BY 
          P.Date DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
      `);
  
    return result.recordset;
  },

  async getPostsByUserCount(userId) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT COUNT(DISTINCT P.PostId) AS totalCount
        FROM Post P
        LEFT JOIN PostMedia PM ON P.PostId = PM.PostId
        WHERE P.UserId = @UserId
      `);
    return result.recordset[0].totalCount;
  },

    async postExists(postId) {
      const pool = await connectToDB();
      const result = await pool.request()
        .input('PostId', sql.UniqueIdentifier, postId)
        .query(`
          SELECT COUNT(*) as count
          FROM Post
          WHERE PostId = @PostId
        `);
    
      return result.recordset[0].count > 0;
    },

    async isPostBookmarkedByUser(postId, userId){ 
      const pool = await connectToDB();
      const result = await pool.request()
      .input('PostId', sql.UniqueIdentifier, postId)
      .input('UserId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT COUNT(*) as count
        FROM SavedPosts
        WHERE PostId = @PostId AND UserId = @UserId
      `);
    
    return result.recordset[0].count > 0;
    },



    
  };




module.exports = PostRepository;