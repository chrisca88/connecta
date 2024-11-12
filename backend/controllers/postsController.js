const PostRepository = require("../repositories/PostRepository");
const CommentRepository = require("../repositories/CommentsRepository");
const { v4: uuidv4 } = require('uuid'); 
const cloudinary = require('cloudinary').v2;
const UserRepository = require("../repositories/UserRepository");
const MediaRepository = require("../repositories/MediaRepository");
const LikeRepository = require('../repositories/LikeRepository');


exports.createPost = async (req, res) => {
  const { caption, location } = req.body;
  const userId = req.user.id;
  const mediaFiles = req.files;

  if (!mediaFiles || mediaFiles.length === 0) {
    return res.status(400).json({ message: "At least one media file is required" });
  }

  try {
    const postId = uuidv4();


    await PostRepository.createPost({
      postId,
      userId,
      caption,
      location,
    });

    const mediaUrls = [];

    for (const file of mediaFiles) {

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
            folder: `posts/${userId}/${postId}`,
            public_id: uuidv4(),
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });


      const mediaId = await MediaRepository.createMedia(result.secure_url);


      await MediaRepository.createPostMedia(postId, mediaId);

      mediaUrls.push(result.secure_url);
    }

    const author = await UserRepository.findById(userId);

    res.status(201).json({
      id: postId,
      media: mediaUrls.length === 1 ? mediaUrls[0] : mediaUrls,
      caption,
      location,
      createdAt: new Date().toISOString(),
      author: {
        id: author.UserId,
        nickname: author.Nickname,
        profile_image: author.ProfileImageUrl,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getPostById = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await PostRepository.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const mediaUrls = await MediaRepository.getMediaUrlsByPostId(postId);


    const liked = await LikeRepository.isPostLikedByUser(postId, userId);
    const likeCount = await LikeRepository.getLikeCount(postId);
    const isBookmarked = await PostRepository.isPostBookmarkedByUser(postId, userId);

    res.json({
      id: post.PostId,
      media: mediaUrls.length === 1 ? mediaUrls[0] : mediaUrls,
      caption: post.Caption,
      location: post.Location,
      createdAt: post.Date,
      likeCount: likeCount,      
      liked: liked,              
      isBookmarked: isBookmarked, 
      author: {
        id: post.UserId,
        nickname: post.AuthorNickname,
        profile_image: post.ProfileImageUrl,
      },
    });
  } catch (error) {
    console.error("Error getting the post:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



exports.deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id; 
  
  try {

    const post = await PostRepository.getPostById(postId);
    if (!post) {

      return res.status(404).json({ message: "Post not found" });
    }


    if (post.UserId !== userId) {

      return res.status(401).json({ message: "Unauthorized to delete this post" });
    }


    await PostRepository.deletePost(postId, userId);


    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server Error" });
  }
};




exports.getComments = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;
  try {
    const comments = await CommentRepository.getCommentsByPost(postId, userId);
    res.json(comments);
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;
  
  if (!content) {
    return res.status(400).json({ message: "Comment content cannot be empty" });
  }
  
  try {
    await CommentRepository.addComment(postId, userId, content); 
    res.status(201).json({ message: "Comment successfully added" });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {

    const postExists = await PostRepository.postExists(postId);
    if (!postExists) {
      return res.status(404).json({ message: "The post does not exist" });
    }


    const existingLike = await LikeRepository.checkIfLiked(postId, userId);
    if (existingLike) {
      return res.status(400).json({ message: "You have already liked this post" });
    }

 
    await LikeRepository.likePost(postId, userId);
    res.status(201).json({ message: "Post liked successfully" });
  } catch (error) {
    console.error("Error when liking the post:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.unlikePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {

    const postExists = await PostRepository.postExists(postId);
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }


    const existingLike = await LikeRepository.checkIfLiked(postId, userId);
    if (!existingLike) {
      return res.status(400).json({ message: "You haven't liked this post" });
    }


    await LikeRepository.unlikePost(postId, userId);
    res.status(200).json({ message: "Like successfully removed" });
  } catch (error) {
    console.error("Error removing the like to the post:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
