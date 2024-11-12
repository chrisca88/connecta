const { sql, connectToDB } = require('../dbConfig');

const MediaRepository = {

  async createMedia(mediaUrl) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('MediaUrl', sql.NVarChar(255), mediaUrl)
      .query(`
        INSERT INTO Media (MediaUrl)
        OUTPUT INSERTED.MediaId
        VALUES (@MediaUrl)
      `);
    return result.recordset[0].MediaId;
  },


  async createPostMedia(postId, mediaId) {
    const pool = await connectToDB();
    await pool.request()
      .input('PostId', sql.UniqueIdentifier, postId)
      .input('MediaId', sql.UniqueIdentifier, mediaId)
      .query(`
        INSERT INTO PostMedia (PostId, MediaId)
        VALUES (@PostId, @MediaId)
      `);
  },


  async getMediaUrlsByPostId(postId) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('PostId', sql.UniqueIdentifier, postId)
      .query(`
        SELECT M.MediaUrl
        FROM Media M
        JOIN PostMedia PM ON PM.MediaId = M.MediaId
        WHERE PM.PostId = @PostId
      `);
    return result.recordset.map(row => row.MediaUrl);
  },
};

module.exports = MediaRepository;
