const PostRepository = require('../repositories/PostRepository');
const LikeRepository = require('../repositories/LikeRepository');



exports.getFeed = async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  const currentUserId = req.user.id;

  try {
    const postsData = await PostRepository.getFeedPosts(currentUserId, limit, offset);
    const totalCount = await PostRepository.getFeedPostCount(currentUserId);

    const postsMap = {};

    for (const post of postsData) {
      const postId = post.PostId;

      if (!postsMap[postId]) {
        const likeCount = await LikeRepository.getLikeCount(postId);
        const liked = await LikeRepository.isPostLikedByUser(postId, currentUserId);
        const isBookmarked = await PostRepository.isPostBookmarkedByUser(postId, currentUserId);

        postsMap[postId] = {
          id: postId,
          media: [],
          caption: post.Caption,
          location: post.Location,
          createdAt: post.Date,
          likeCount: likeCount,     
          liked: liked,             
          isBookmarked: isBookmarked, 
          author: {
            id: post.UserId,
            nickname: post.Nickname,
            profile_image: post.ProfileImageUrl,
          }
        };
      }

      postsMap[postId].media.push(post.MediaUrl);
    }

    const posts = Object.values(postsMap).map(post => ({
      ...post,
      media: post.media.length === 1 ? post.media[0] : post.media,
    }));

    res.json({
      totalCount,
      posts,
    });
  } catch (error) {
    console.error("Error getting feed:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

  