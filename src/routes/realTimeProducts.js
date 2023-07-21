const express = require('express');
const router = express.Router();
const path = require('path')
const filePath = path.join(__dirname, "..", "data", "products.json");

const ProductManager = require('../managers/ProductManager')
const productManager = new ProductManager(filePath)


router.get('/', async (req, res) => {
    const products = await productManager.getProductos()
    res.render('realTimeProducts', {products})
  })
  
  
  router.post('/', async (req, res) => {
    try{
        const newProduct = req.body; // Suponiendo que el nuevo producto se envía en el cuerpo de la solicitud POST
        console.log('new product', newProduct)
        const product = await productManager.addProduct(newProduct);
      console.log(product)
        if (product) {
          const updatedProducts = await productManager.getProductos();
      
          req.io.emit('updateProducts', updatedProducts); // Aquí está la emisión del evento 'updateProducts'
    
          res.status(200).json({ status: 200, message: 'Product added successfully', product });
        }
        else{
            res.status(400).json({ status: 404, message: 'Failed to add the product, please check it' });
        }
    }
    catch(err){
      console.error(err);
        res.status(500).json({status: 500, message: 'Error processing the request', err });
    }
   
  
    
  });
  
  router.delete('/:id', async (req, res) => {
    const productId = req.params.id;
    const deleted = await productManager.deleteProduct(+productId);
  
    if (deleted) {
      // Obtener la lista actualizada de productos
      const updatedProducts = await productManager.getProductos();
  
      // Emitir la lista de productos actualizada a todos los clientes conectados
      req.io.emit('updateProducts', updatedProducts); // Aquí está la emisión del evento 'updateProducts'
  
      res.status(200).json({ message: 'Product deleted' });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  });

  module.exports = router