const UserRepository = require('../repositories/UserRepository');
const UserFollowsRepository = require('../repositories/UserFollowsRepository');
const SavedPostsRepository = require('../repositories/SavedPostsRepository');
const PostRepository = require('../repositories/PostRepository');
const LikeRepository = require ('../repositories/LikeRepository');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');


const storage = multer.memoryStorage();
const upload = multer({ storage });


exports.searchUsers = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: 'El parámetro "query" es requerido' });
  }

  try {
    const users = await UserRepository.searchUsers(query);
    res.json({ users });
  } catch (error) {
    console.error('Error searching for users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await UserRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateUserProfile = async (req, res) => {
  const updateData = req.body;
  const currentUserId = req.user.id;

  try {
    const user = await UserRepository.findById(currentUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await UserRepository.updateUser(currentUserId, updateData);
    res.json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.updateUserImage = async (req, res) => {
    const { imageType } = req.query;
    const imageFile = req.file; 
    const currentUserId = req.user.id;
  
  if (!['profile', 'banner'].includes(imageType)) {
    return res.status(400).json({ message: 'Invalid image type' });
  }

  if (!imageFile) {
    return res.status(400).json({ message: 'Image file required' });
  }

  try {
    const user = await UserRepository.findById(currentUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: `user_images/${currentUserId}/${imageType}`, 
          public_id: `${uuidv4()}`,
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(imageFile.buffer);
    });

    const imageUrl = result.secure_url;

 
    const updateData = {};
    if (imageType === 'profile') {
      updateData.ProfileImageUrl = imageUrl;
    } else if (imageType === 'banner') {
      updateData.BannerImageUrl = imageUrl;
    }

    await UserRepository.updateUser(currentUserId, updateData);

    res.json({
      message: 'Image updated successfully',
      url: imageUrl,
    });
  } catch (error) {
    console.error('Error updating user image:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getFollowers = async (req, res) => {
  const { userId } = req.params;

  try {
    const followers = await UserFollowsRepository.getFollowers(userId);
    res.json(followers);
  } catch (error) {
    console.error('Error getting followers:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getFollowing = async (req, res) => {
  const { userId } = req.params;

  try {
    const following = await UserFollowsRepository.getFollowing(userId);
    res.json(following);
  } catch (error) {
    console.error('Error getting followed users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.followUser = async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user.id; 

  if (userId === followerId) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  try {
    await UserFollowsRepository.followUser(followerId, userId);
    res.status(201).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.unfollowUser = async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user.id;

  if (userId === followerId) {
    return res.status(400).json({ message: "You can't stop following yourself" });
  }

  try {
    await UserFollowsRepository.unfollowUser(followerId, userId);
    res.json({ message: 'You have stopped following the user' });
  } catch (error) {
    console.error('Error when unfollowing user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getUserFavorites = async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const favorites = await SavedPostsRepository.getUserFavorites(currentUserId);
    res.json(favorites);
  } catch (error) {
    console.error('Error getting user favorites:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.addPostToFavorites = async (req, res) => {
  const { postId  } = req.params;
  const currentUserId = req.user.id;

  try {
    await SavedPostsRepository.addFavorite(currentUserId, postId);
    res.status(201).json({ message: 'Post added to favorites' });
  } catch (error) {
    console.error('Error when adding post to favorites:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.removePostFromFavorites = async (req, res) => {
  const { postId } = req.params;
  const currentUserId = req.user.id;

  try {
    await SavedPostsRepository.removeFavorite(currentUserId, postId);
    res.status(201).json({ message: 'Post removed from favorites' });
  } catch (error) {
    console.error('Error when deleting post from favorites:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteUserAccount = async (req, res) => {
  const currentUserId = req.user.id;

  try {
    await UserRepository.deleteUser(currentUserId);
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getPostsByUser = async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, offset = 0 } = req.query;
  const currentUserId = req.user.id;

  try {
    const postsData = await PostRepository.getPostsByUser(userId, limit, offset);
    const totalCount = await PostRepository.getPostsByUserCount(userId);

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
            nickname: post.Nickname || "Unknown",
            profile_image: post.ProfileImageUrl || "",
          }
        };
      }

      if (post.MediaUrl) {
        postsMap[postId].media.push(post.MediaUrl);
      }
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
    console.error("Error while getting posts from user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};