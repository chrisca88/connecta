USE ConnectaDB;


INSERT INTO [User] (UserId, Name, Surname, Nickname, Email, Bio, PhoneNumber, Gender, Gamification, PasswordHash, ProfileImageUrl, BannerImageUrl) VALUES
(NEWID(), 'Juan', 'Pérez', 'juanp', 'juan@example.com', 'Amo la fotografía', '123456789', 'Masculino', 10, 'hashed_password_juan', 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731360986/user_images/0D866F9C-FB9C-4DBB-A9DD-C74DB694E5A7/banner/5ef72a3a-06ab-43d2-a85e-8724cb849b78.jpg', 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354181/cld-sample-2.jpg'),
(NEWID(), 'Ana', 'López', 'anal', 'ana@example.com', 'Viajera apasionada', '987654321', 'Femenino', 20, 'hashed_password_ana', 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354181/samples/woman-on-a-football-field.jpg', 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354181/cld-sample-3.jpg'),
(NEWID(), 'Carlos', 'Martínez', 'cmart', 'carlos@example.com', 'Amante de la música', '567891234', 'Masculino', 15, 'hashed_password_carlos', 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354179/samples/look-up.jpg', 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354181/cld-sample.jpg'),
(NEWID(), 'Laura', 'Fernández', 'lauraf', 'laura@example.com', 'Me encanta el arte', '123459876', 'Femenino', 5, 'hashed_password_laura', 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354181/cld-sample.jpg', 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354181/cld-sample-2.jpg'),
(NEWID(), 'Santiago', 'García', 'santi', 'santi@example.com', 'Explorador urbano', '223344556', 'Masculino', 8, 'hashed_password_santi', 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354179/samples/look-up.jpg', 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354181/samples/woman-on-a-football-field.jpg');


DECLARE @PostJuan1 uniqueidentifier = NEWID();
DECLARE @PostJuan2 uniqueidentifier = NEWID();
DECLARE @PostAna1 uniqueidentifier = NEWID();
DECLARE @PostCarlos1 uniqueidentifier = NEWID();
DECLARE @PostLaura1 uniqueidentifier = NEWID();
DECLARE @PostSanti1 uniqueidentifier = NEWID();

INSERT INTO Post (PostId, UserId, Caption, Date, Location) VALUES
(@PostJuan1, (SELECT UserId FROM [User] WHERE Nickname = 'juanp'), 'Amanecer en la playa', GETDATE(), 'Miami Beach'),
(@PostJuan2, (SELECT UserId FROM [User] WHERE Nickname = 'juanp'), 'Visita al museo de arte', GETDATE(), 'Madrid'),
(@PostAna1, (SELECT UserId FROM [User] WHERE Nickname = 'anal'), 'Hermoso atardecer en la montaña', GETDATE(), 'Andes'),
(@PostCarlos1, (SELECT UserId FROM [User] WHERE Nickname = 'cmart'), 'Concierto en vivo', GETDATE(), 'Madrid'),
(@PostLaura1, (SELECT UserId FROM [User] WHERE Nickname = 'lauraf'), 'Arte callejero en el centro', GETDATE(), 'Buenos Aires'),
(@PostSanti1, (SELECT UserId FROM [User] WHERE Nickname = 'santi'), 'Exploración nocturna', GETDATE(), 'Nueva York');


DECLARE @Media1 uniqueidentifier = NEWID();
DECLARE @Media2 uniqueidentifier = NEWID();
DECLARE @Media3 uniqueidentifier = NEWID();
DECLARE @Media4 uniqueidentifier = NEWID();
DECLARE @Media5 uniqueidentifier = NEWID();
DECLARE @Media6 uniqueidentifier = NEWID();

INSERT INTO Media (MediaId, MediaUrl) VALUES
(@Media1, 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354181/cld-sample-2.jpg'),
(@Media2, 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354181/cld-sample-3.jpg'),
(@Media3, 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354181/cld-sample.jpg'),
(@Media4, 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354181/samples/woman-on-a-football-field.jpg'),
(@Media5, 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354179/samples/look-up.jpg'),
(@Media6, 'https://res.cloudinary.com/dlknshmvc/image/upload/v1731354181/cld-sample-2.jpg');


INSERT INTO PostMedia (PostId, MediaId) VALUES
(@PostJuan1, @Media1),
(@PostJuan2, @Media2),
(@PostAna1, @Media3),
(@PostCarlos1, @Media4),
(@PostLaura1, @Media5),
(@PostSanti1, @Media6);


INSERT INTO Comment (CommentId, PostId, UserId, Content) VALUES
(NEWID(), @PostJuan1, (SELECT UserId FROM [User] WHERE Nickname = 'anal'), '¡Increíble foto, Juan!'),
(NEWID(), @PostAna1, (SELECT UserId FROM [User] WHERE Nickname = 'juanp'), '¡Qué hermoso lugar!'),
(NEWID(), @PostCarlos1, (SELECT UserId FROM [User] WHERE Nickname = 'lauraf'), 'El concierto estuvo increíble!'),
(NEWID(), @PostLaura1, (SELECT UserId FROM [User] WHERE Nickname = 'santi'), '¡Gran captura del arte urbano!'),
(NEWID(), @PostSanti1, (SELECT UserId FROM [User] WHERE Nickname = 'cmart'), 'Explorar la ciudad de noche es lo mejor.');


INSERT INTO [Like] (PostId, UserId) VALUES
(@PostJuan1, (SELECT UserId FROM [User] WHERE Nickname = 'cmart')),
(@PostJuan2, (SELECT UserId FROM [User] WHERE Nickname = 'anal')),
(@PostAna1, (SELECT UserId FROM [User] WHERE Nickname = 'santi')),
(@PostCarlos1, (SELECT UserId FROM [User] WHERE Nickname = 'lauraf')),
(@PostLaura1, (SELECT UserId FROM [User] WHERE Nickname = 'juanp')),
(@PostSanti1, (SELECT UserId FROM [User] WHERE Nickname = 'anal'));


INSERT INTO SavedPosts (PostId, UserId) VALUES
(@PostJuan1, (SELECT UserId FROM [User] WHERE Nickname = 'anal')),
(@PostJuan2, (SELECT UserId FROM [User] WHERE Nickname = 'cmart')),
(@PostCarlos1, (SELECT UserId FROM [User] WHERE Nickname = 'santi')),
(@PostLaura1, (SELECT UserId FROM [User] WHERE Nickname = 'juanp'));


INSERT INTO UserFollows (FollowerId, FollowedId) VALUES
((SELECT UserId FROM [User] WHERE Nickname = 'juanp'), (SELECT UserId FROM [User] WHERE Nickname = 'anal')),
((SELECT UserId FROM [User] WHERE Nickname = 'anal'), (SELECT UserId FROM [User] WHERE Nickname = 'cmart')),
((SELECT UserId FROM [User] WHERE Nickname = 'cmart'), (SELECT UserId FROM [User] WHERE Nickname = 'lauraf')),
((SELECT UserId FROM [User] WHERE Nickname = 'lauraf'), (SELECT UserId FROM [User] WHERE Nickname = 'santi')),
((SELECT UserId FROM [User] WHERE Nickname = 'santi'), (SELECT UserId FROM [User] WHERE Nickname = 'juanp'));