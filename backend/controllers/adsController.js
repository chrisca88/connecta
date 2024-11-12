const AdRepository = require("../repositories/AdRepository");

const getAds = async (req, res) => {
    try {
        const ads = await AdRepository.fetchAds();
    
        res.status(200).json(ads);
      } catch (error) {
        console.error('Error getting ads:', error);
        res.status(500).json({ message: 'Error getting ads' });
      }
    };

module.exports = {
  getAds,
};
