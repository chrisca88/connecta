const express = require('express');
const router = express.Router();
const multer = require('multer');
const postsController = require('../controllers/postsController');
const authenticate = require('../middleware/authenticate');


const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post('/', authenticate, upload.array('mediaFiles'), postsController.createPost);


router.get('/:postId', authenticate, postsController.getPostById);


router.delete('/:postId', authenticate, postsController.deletePost);



router.get('/:postId/comments', authenticate, postsController.getComments);


router.post('/:postId/comments', authenticate, postsController.addComment);


router.post('/:postId/like', authenticate, postsController.likePost);


router.delete('/:postId/unlike', authenticate, postsController.unlikePost);

module.exports = router;
