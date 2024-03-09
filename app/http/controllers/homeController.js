const Menu = require('../../models/menu');

const homeController = () => {
  return {
    index: async (req, res) => {
      try {
        const pizzas = await Menu.find();
        res.render("home", { pizzas: pizzas });
      } catch (error) {
        console.error('Error fetching pizzas:', error);
        // Handle the error or send an error response
        res.status(500).send('Internal Server Error');
      }
    },
  };
};

module.exports = homeController;
