const {Router} = require("express")
const ProductManager = require("../../managers/ProductManager")
const path = require("path");//importo el modulo de fileSystemPath para pasar de una manera más facil la ruta donde voy a almacenar mis productos.
const filePath = path.join(__dirname, "..", "..", "data", "products.json");


const productManager = new ProductManager(filePath);
const router = Router()

router.get("/", async(req, res) =>{
    const limit = req.query.limit
    const productos = await productManager.getProductos()
    if (limit){
        return res.send(productos.slice(0,limit))
    }

   return res.send(productos)
})

router.get("/:pid", async (req, res) => {
    const id = req.params.pid;
    try {
        const product = await productManager.getById(+id);

        if (product) {
            res.status(200).json({ status: 200, product });
        } else {
            res.status(404).json({ status: 404, message: `The Product with ID: ${id} is not found. Please try again with a different ID` });
        }
    } catch (error) {
        console.log("Error retrieving the product", error);
        res.status(500).json({ status:500, message: 'Error retrieving the product' });
    }
});


router.post("/", async (req, res) => {
    const { body } = req;
    try {
      const product = await productManager.addProduct(body);
  
      if (product) {
        const updatedProducts = await productManager.getProductos();
        req.io.emit('updateProducts', updatedProducts); // Aquí está la emisión del evento 'updateProducts'
        res.status(200).json({ status: 200, message: 'Product added successfully', product });

      } else {
        res.status(400).json({ status: 404, message: 'Failed to add the product' });
      }
    } catch (error) {
      res.status(500).json({status: 500, message: 'Error processing the request' });
    }
  });
  
  

router.put('/:pid', async (req, res) => {
    const { body } = req;
    const id = req.params.pid;
    try {
        const product = await productManager.updateProduct(+id, body);

        if (!product) {
            res.status(404).json({ error: `The product with the id ${id} is not found, please try with a different ID` });
            return;
        } else {
            res.status(202).json({ status: 200, message: 'Product updated successfully', product });
        }
    } catch (error) {
        console.log("Error updating the product", error);
        res.status(500).json({ error: 'Error updating the product' });
    }
});


router.delete("/:pid", async (req, res) => {
    const id = req.params.pid;
    try {
        const product = await productManager.deleteProduct(+id);

        if (!product) {
            return res.status(404).json({ status: 404, message: `The product with the id ${id} is not found, please try with a different ID` });
        } 
        const updatedProducts = await productManager.getProductos();
        req.io.emit('updateProducts', updatedProducts); // Aquí está la emisión del evento 'updateProducts'
        return res.status(200).json({ status: 200, message: `Product with ID: ${id}, successfully deleted` });
    } catch (error) {
        console.log("Error deleting the product", error);
        res.status(500).json({ error: 'Error deleting the product' });
    }
});


  module.exports = router
  