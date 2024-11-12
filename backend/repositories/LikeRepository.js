const { sql, connectToDB } = require('../dbConfig');

const LikeRepository = {
    async checkIfLiked(postId, userId) {
        const pool = await connectToDB();
        const result = await pool.request()
        .input('PostId', sql.UniqueIdentifier, postId)
        .input('UserId', sql.UniqueIdentifier, userId)
        .query(`
            SELECT COUNT(*) as count
            FROM [Like]
            WHERE PostId = @PostId AND UserId = @UserId
        `);

        return result.recordset[0].count > 0;
        },

    async likePost(postId, userId) {
        const pool = await connectToDB();
        await pool.request()
            .input('PostId', sql.UniqueIdentifier, postId)
            .input('UserId', sql.UniqueIdentifier, userId)
            .query(
                `INSERT INTO [Like] (PostId, UserId)
                VALUES (@PostId, @UserId)`
            );
        },
    
    async unlikePost(postId, userId) {
        const pool = await connectToDB();
        await pool.request()
            .input('PostId', sql.UniqueIdentifier, postId)
            .input('UserId', sql.UniqueIdentifier, userId)
            .query(`DELETE FROM [Like] WHERE PostId = @PostId AND UserId = @UserId`);
        },
    async getLikeCount(postId) {
            const pool = await connectToDB();
            const result = await pool.request()
            .input('PostId', sql.UniqueIdentifier, postId)
            .query(
                `SELECT COUNT(*) AS likeCount
                FROM [Like]
                WHERE PostId = @PostId`
            );
            return result.recordset[0].likeCount;
        },
        
    async isPostLikedByUser(postId, userId) {
            const pool = await connectToDB();
            const result = await pool.request()
            .input('PostId', sql.UniqueIdentifier, postId)
            .input('UserId', sql.UniqueIdentifier, userId)
            .query(
                `SELECT COUNT(*) AS count
                FROM [Like]
                WHERE PostId = @PostId AND UserId = @UserId`
            );
            return result.recordset[0].count > 0;
        },
    };


module.exports = LikeRepository;