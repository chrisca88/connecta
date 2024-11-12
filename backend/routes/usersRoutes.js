const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authenticate = require('../middleware/authenticate');
const multer = require('multer');


const storage = multer.memoryStorage();
const upload = multer({ storage });


router.get('/search', usersController.searchUsers);


router.get('/:userId/profile', usersController.getUserProfile);


router.patch('/profile', authenticate, usersController.updateUserProfile);


router.patch(
  '/image',
  authenticate,
  upload.single('image'), 
  usersController.updateUserImage
);


router.get('/:userId/followers', usersController.getFollowers);


router.get('/:userId/following', usersController.getFollowing);


router.post('/:userId/follow', authenticate, usersController.followUser);


router.post('/:userId/unfollow', authenticate, usersController.unfollowUser);


router.get('/favorites', authenticate, usersController.getUserFavorites);


router.post(
  '/favorites/:postId',
  authenticate,
  usersController.addPostToFavorites
);


router.delete(
  '/favorites/:postId',
  authenticate,
  usersController.removePostFromFavorites
);


router.delete('/delete', authenticate, usersController.deleteUserAccount);


router.get('/:userId/posts', authenticate, usersController.getPostsByUser);

module.exports = router;
