const axios = require('axios');

const AdRepository = {
  async fetchAds() {
    try {
      const response = await axios.get('https://my-json-server.typicode.com/chrismazzeo/advertising_da1/ads');
      

      const ads = response.data.map(ad => ({
        id: ad.commerce.toLowerCase(), 
        name: ad.commerce,
        urlCompany: ad.Url,
        imageUrl: ad.imagePath[0].landscape,
        startDate: new Date(ad.date.start * 1000).toISOString().split('T')[0], 
        endDate: new Date(ad.date.end * 1000).toISOString().split('T')[0],
      }));

      return ads;
    } catch (error) {
      console.error('Error al obtener los anuncios:', error);
      return [];
    }
  }
};

module.exports = AdRepository;
