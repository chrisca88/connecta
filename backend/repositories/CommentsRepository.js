const { sql, connectToDB } = require('../dbConfig');

const CommentRepository = {


  async addComment(postId, userId, content) {
    const pool = await connectToDB();
    await pool.request()
      .input('PostId', sql.UniqueIdentifier, postId)
      .input('UserId', sql.UniqueIdentifier, userId)
      .input('Content', sql.NVarChar(sql.MAX), content)
      .query(`
        INSERT INTO Comment (PostId, UserId, Content, Date)
        VALUES (@PostId, @UserId, @Content, GETDATE())
      `);
  },


  async getCommentsByPost(postId) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('PostId', sql.UniqueIdentifier, postId)
      .query(`
        SELECT c.CommentId, c.Content, c.Date, u.UserId, u.Nickname
        FROM Comment c
        JOIN [User] u ON c.UserId = u.UserId
        WHERE c.PostId = @PostId
        ORDER BY c.Date DESC
      `);
    return result.recordset;
  },


  async deleteComment(commentId, userId) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('CommentId', sql.UniqueIdentifier, commentId)
      .input('UserId', sql.UniqueIdentifier, userId)
      .query(`
        DELETE FROM Comment
        WHERE CommentId = @CommentId AND UserId = @UserId
      `);
    return result.rowsAffected[0]; 
  }

};

module.exports = CommentRepository;
