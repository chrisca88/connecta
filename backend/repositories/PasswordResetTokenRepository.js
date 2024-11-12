const { sql, connectToDB } = require('../dbConfig');

const PasswordResetTokenRepository = {
  async create(tokenData) {
    const pool = await connectToDB();
    await pool.request()
      .input('UserId', sql.UniqueIdentifier, tokenData.userId)
      .input('ResetToken', sql.NVarChar(6), tokenData.resetToken)
      .input('ExpiresAt', sql.DateTime, tokenData.expiresAt)
      .query(`
        INSERT INTO PasswordResetToken (UserId, ResetToken, ExpiresAt)
        VALUES (@UserId, @ResetToken, @ExpiresAt)
      `);
  },


  async findValidToken(userId, resetToken) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .input('ResetToken', sql.NVarChar(6), resetToken)
      .query(`
        SELECT * FROM PasswordResetToken
        WHERE UserId = @UserId AND ResetToken = @ResetToken AND ExpiresAt > GETDATE()
      `);
    return result.recordset[0];
  },

  async deleteByUserId(userId) {
    const pool = await connectToDB();
    await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .query('DELETE FROM PasswordResetToken WHERE UserId = @UserId');
  },
};

module.exports = PasswordResetTokenRepository;
