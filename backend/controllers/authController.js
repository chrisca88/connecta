const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const UserRepository = require('../repositories/UserRepository');
const PasswordResetTokenRepository = require('../repositories/PasswordResetTokenRepository');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {

    const user = await UserRepository.findByEmail(email);
    

    if (!user || !await bcrypt.compare(password, user.PasswordHash)) {
      return res.status(401).json({ message: 'Email or password incorrect' });
    }
    

    const token = jwt.sign({ id: user.UserId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    

    res.json({
      token,
      userId: user.UserId
    });
    
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.signup = async (req, res) => {
  const { name, surname, nickname, email, password } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await UserRepository.create({
      name,
      surname,
      nickname,
      email,
      passwordHash,
    });

    res.status(201).json({ message: 'Successfully registered user' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3600000);

    await PasswordResetTokenRepository.create({
      userId: user.UserId,
      resetToken: resetCode,
      expiresAt,
    });


    const templatePath = path.join(__dirname,  '..', 'templates', 'resetPassword.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf8');
    htmlContent = htmlContent.replace('{{resetCode}}', resetCode);


    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Recovery Code',
      html: htmlContent, 
    });

    res.json({ message: 'Recovery code sent to email' });
  } catch (error) {
    console.error('Error sending recovery email:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const validCode = await PasswordResetTokenRepository.findValidToken(user.UserId, code);
    if (!validCode) {
      return res.status(404).json({ message: 'Incorrect or expired code' });
    }

    res.json({ message: 'Code verified successfully' });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(user.UserId, passwordHash);


    await PasswordResetTokenRepository.deleteByUserId(user.UserId);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.logout = (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(400).json({ message: 'Token required to log out' });
  }

  res.json({ message: 'Successfully logged out' });
};

exports.me = async (req, res) => {
  const userId = req.user.id;
  try {

    const user = await UserRepository.findById(userId); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};