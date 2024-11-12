const { sql, connectToDB } = require('../dbConfig');

const UserRepository = {

  
  async findByEmail(email) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('Email', sql.NVarChar(255), email)
      .query('SELECT * FROM [User] WHERE Email = @Email');
    return result.recordset[0];
  },


  async create(userData) {
    const pool = await connectToDB();
    await pool.request()
      .input('Name', sql.NVarChar(50), userData.name)
      .input('Surname', sql.NVarChar(50), userData.surname)
      .input('Nickname', sql.NVarChar(50), userData.nickname)
      .input('Email', sql.NVarChar(255), userData.email)
      .input('PasswordHash', sql.NVarChar(255), userData.passwordHash)
      .query(`
        INSERT INTO [User] (Name, Surname, Nickname, Email, PasswordHash)
        VALUES (@Name, @Surname, @Nickname, @Email, @PasswordHash)
      `);
  },


  async updatePassword(userId, passwordHash) {
    const pool = await connectToDB();
    await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .input('PasswordHash', sql.NVarChar(255), passwordHash)
      .query('UPDATE [User] SET PasswordHash = @PasswordHash WHERE UserId = @UserId');
  },


  async findById(userId) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .query('SELECT UserId, Name, Surname, Nickname, Email, Bio, PhoneNumber, Gender, ProfileImageUrl, BannerImageUrl FROM [User] WHERE UserId = @UserId');
    return result.recordset[0];
  },


   async searchUsers(query) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('Query', sql.NVarChar(255), `%${query}%`)
      .query(`
        SELECT UserId, Name, Surname, Nickname, ProfileImageUrl
        FROM [User]
        WHERE Nickname LIKE @Query
      `);
    return result.recordset;
  },


  async updateUser(userId, updateData) {
    const pool = await connectToDB();
    const request = pool.request()
      .input('UserId', sql.UniqueIdentifier, userId);
  
    let setClauses = [];
    
    if (updateData.name) {
      request.input('Name', sql.NVarChar(50), updateData.name);
      setClauses.push('Name = @Name');
    }
    if (updateData.surname) {
      request.input('Surname', sql.NVarChar(50), updateData.surname);
      setClauses.push('Surname = @Surname');
    }
    if (updateData.nickname) {
      request.input('Nickname', sql.NVarChar(50), updateData.nickname);
      setClauses.push('Nickname = @Nickname');
    }
    if (updateData.email) {
      request.input('Email', sql.NVarChar(255), updateData.email);
      setClauses.push('Email = @Email');
    }
    if (updateData.bio) {
      request.input('Bio', sql.NVarChar(255), updateData.bio);
      setClauses.push('Bio = @Bio');
    }
    if (updateData.phone) {
      request.input('PhoneNumber', sql.NVarChar(15), updateData.phone);
      setClauses.push('PhoneNumber = @PhoneNumber');
    }
    if (updateData.gender) {
      request.input('Gender', sql.NVarChar(10), updateData.gender);
      setClauses.push('Gender = @Gender');
    }
    if (updateData.ProfileImageUrl) {
      request.input('ProfileImageUrl', sql.NVarChar(255), updateData.ProfileImageUrl);
      setClauses.push('ProfileImageUrl = @ProfileImageUrl');
    }
    if (updateData.BannerImageUrl) {
      request.input('BannerImageUrl', sql.NVarChar(255), updateData.BannerImageUrl);
      setClauses.push('BannerImageUrl = @BannerImageUrl');
    }
  
    if (setClauses.length === 0) {
      throw new Error('No fields provided for update');
    }
  
    const setClause = setClauses.join(', ');
  
    await request.query(`
      UPDATE [User] SET ${setClause} WHERE UserId = @UserId
    `);
  },


  async deleteUser(userId) {
    const pool = await connectToDB();
    await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .query(`
        DELETE FROM [User] WHERE UserId = @UserId
      `);
  },
};

module.exports = UserRepository;
