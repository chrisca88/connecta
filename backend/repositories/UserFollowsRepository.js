const { sql, connectToDB } = require('../dbConfig');

const UserFollowsRepository = {

  async getFollowers(userId) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT UF.FollowerId, U.Name, U.Surname, U.Nickname, U.ProfileImageUrl
        FROM UserFollows UF
        JOIN [User] U ON UF.FollowerId = U.UserId
        WHERE UF.FollowedId = @UserId
      `);
    return result.recordset;
  },

  async getFollowing(userId) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT UF.FollowedId, U.Name, U.Surname, U.Nickname, U.ProfileImageUrl
        FROM UserFollows UF
        JOIN [User] U ON UF.FollowedId = U.UserId
        WHERE UF.FollowerId = @UserId
      `);
    return result.recordset;
  },


  async followUser(followerId, followedId) {
    const pool = await connectToDB();
    await pool.request()
      .input('FollowerId', sql.UniqueIdentifier, followerId)
      .input('FollowedId', sql.UniqueIdentifier, followedId)
      .query(`
        INSERT INTO UserFollows (FollowerId, FollowedId)
        VALUES (@FollowerId, @FollowedId)
      `);
  },


  async unfollowUser(followerId, followedId) {
    const pool = await connectToDB();
    await pool.request()
      .input('FollowerId', sql.UniqueIdentifier, followerId)
      .input('FollowedId', sql.UniqueIdentifier, followedId)
      .query(`
        DELETE FROM UserFollows
        WHERE FollowerId = @FollowerId AND FollowedId = @FollowedId
      `);
  },
};

module.exports = UserFollowsRepository;