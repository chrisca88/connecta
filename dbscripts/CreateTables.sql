
CREATE DATABASE ConnectaDB;
GO


USE ConnectaDB;
GO


CREATE TABLE [User] (
    UserId uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(50) NOT NULL,
    Surname NVARCHAR(50) NOT NULL,
    Nickname NVARCHAR(50) UNIQUE NOT NULL,
    Email NVARCHAR(255) UNIQUE NOT NULL,
    Bio NVARCHAR(255),
    PhoneNumber NVARCHAR(15),
    Gender NVARCHAR(10),
    Gamification INT DEFAULT 0,
    PasswordHash NVARCHAR(255) NOT NULL,
    ProfileImageUrl NVARCHAR(255),
    BannerImageUrl NVARCHAR(255)
);
GO


CREATE TABLE Post (
    PostId uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    UserId uniqueidentifier NOT NULL,
    Caption NVARCHAR(255),
    Date DATETIME DEFAULT GETDATE(),
    Location NVARCHAR(255),
    FOREIGN KEY (UserId) REFERENCES [User](UserId) ON DELETE CASCADE
);
GO


CREATE TABLE Comment (
    CommentId uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    PostId uniqueidentifier NOT NULL,
    UserId uniqueidentifier NOT NULL,
    Date DATETIME DEFAULT GETDATE(),
    Content NVARCHAR(255) NOT NULL,
    FOREIGN KEY (PostId) REFERENCES Post(PostId) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES [User](UserId) ON DELETE NO ACTION
);
GO


CREATE TABLE [Like] (
    PostId uniqueidentifier NOT NULL,
    UserId uniqueidentifier NOT NULL,
    PRIMARY KEY (PostId, UserId),
    FOREIGN KEY (PostId) REFERENCES Post(PostId) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES [User](UserId) ON DELETE NO ACTION
);
GO


CREATE TABLE SavedPosts (
    PostId uniqueidentifier NOT NULL,
    UserId uniqueidentifier NOT NULL,
    PRIMARY KEY (PostId, UserId),
    FOREIGN KEY (PostId) REFERENCES Post(PostId) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES [User](UserId) ON DELETE NO ACTION
);
GO


CREATE TABLE UserFollows (
    FollowerId uniqueidentifier NOT NULL,
    FollowedId uniqueidentifier NOT NULL,
    PRIMARY KEY (FollowerId, FollowedId),
    FOREIGN KEY (FollowerId) REFERENCES [User](UserId) ON DELETE NO ACTION,
    FOREIGN KEY (FollowedId) REFERENCES [User](UserId) ON DELETE CASCADE
);
GO


CREATE TABLE Media (
    MediaId uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    MediaUrl NVARCHAR(255) NOT NULL
);
GO


CREATE TABLE PostMedia (
    PostId uniqueidentifier NOT NULL,
    MediaId uniqueidentifier NOT NULL,
    PRIMARY KEY (PostId, MediaId),
    FOREIGN KEY (PostId) REFERENCES Post(PostId) ON DELETE CASCADE,
    FOREIGN KEY (MediaId) REFERENCES Media(MediaId) ON DELETE CASCADE
);
GO


CREATE TABLE PasswordResetToken (
    PasswordResetTokenId uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    UserId uniqueidentifier NOT NULL,
    ResetToken NVARCHAR(255) NOT NULL,
    ExpiresAt DATETIME NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES [User](UserId) ON DELETE CASCADE
);
GO

d
CREATE TRIGGER trg_DeleteRelatedRecordsOnUserDelete
ON [User]
AFTER DELETE
AS
BEGIN

    DELETE FROM Comment
    WHERE UserId IN (SELECT UserId FROM DELETED);


    DELETE FROM [Like]
    WHERE UserId IN (SELECT UserId FROM DELETED);


    DELETE FROM SavedPosts
    WHERE UserId IN (SELECT UserId FROM DELETED);


    DELETE FROM UserFollows
    WHERE FollowerId IN (SELECT UserId FROM DELETED);

    DELETE FROM Media
    WHERE MediaId NOT IN (SELECT MediaId FROM PostMedia);
END;
GO
