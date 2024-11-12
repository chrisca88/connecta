const { sql, connectToDB } = require('../dbConfig');

const SavedPostsRepository = {
  async getUserFavorites(userId) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT SP.PostId, P.Caption, P.Date, M.MediaUrl
        FROM SavedPosts SP
        JOIN Post P ON SP.PostId = P.PostId
        JOIN PostMedia PM ON P.PostId = PM.PostId
        JOIN Media M ON PM.MediaId = M.MediaId
        WHERE SP.UserId = @UserId
      `);


    const favorites = result.recordset.reduce((acc, row) => {
      const { PostId, Caption, Date, MediaUrl } = row;

      let post = acc.find(p => p.PostId === PostId);
      if (!post) {
        post = {
          PostId,
          Caption,
          Date,
          MediaUrls: []
        };
        acc.push(post);
      }

      post.MediaUrls.push(MediaUrl);
      return acc;
    }, []);

    return favorites;
  },


  async addFavorite(userId, postId) {
    const pool = await connectToDB();
    await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .input('PostId', sql.UniqueIdentifier, postId)
      .query(`
        INSERT INTO SavedPosts (UserId, PostId)
        VALUES (@UserId, @PostId)
      `);
  },


  async removeFavorite(userId, postId) {
    const pool = await connectToDB();
    await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .input('PostId', sql.UniqueIdentifier, postId)
      .query(`
        DELETE FROM SavedPosts
        WHERE UserId = @UserId AND PostId = @PostId
      `);
  },
};

module.exports = SavedPostsRepository;