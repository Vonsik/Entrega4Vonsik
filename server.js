const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 8080;

app.use(express.json());

const productsRouter = express.Router();
app.use('/api/products', productsRouter);

let products = [];

productsRouter.get('/', (req, res) => {
  res.json(products);
});

productsRouter.get('/:pid', (req, res) => {
  const { pid } = req.params;
  const product = products.find(p => p.id === pid);
  if (!product) {
    res.status(404).json({ message: 'Producto no encontrado' });
  } else {
    res.json(product);
  }
});

productsRouter.post('/', (req, res) => {
  const newProduct = {
    id: generateId(),
    ...req.body,
    status: true,
  };

  products.push(newProduct);

  saveProductsToDatabase();

  res.status(201).json(newProduct);
});

productsRouter.put('/:pid', (req, res) => {
  const { pid } = req.params;
  const productIndex = products.findIndex(p => p.id === pid);

  if (productIndex === -1) {
    res.status(404).json({ message: 'Producto no encontrado' });
  } else {
    products[productIndex] = { ...products[productIndex], ...req.body };
    saveProductsToDatabase();
    res.json(products[productIndex]);
  }
});

productsRouter.delete('/:pid', (req, res) => {
  const { pid } = req.params;
  products = products.filter(p => p.id !== pid);
  saveProductsToDatabase();
  res.status(204).send();
});

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveProductsToDatabase() {
  fs.writeFileSync('productos.json', JSON.stringify(products, null, 2));
}

const cartsRouter = express.Router();
app.use('/api/carts', cartsRouter);

let carts = [];

cartsRouter.post('/', (req, res) => {
  const newCart = {
    id: generateId(),
    products: [],
  };

  carts.push(newCart);

  saveCartsToDatabase();

  res.status(201).json(newCart);
});

cartsRouter.get('/:cid', (req, res) => {
  const { cid } = req.params;
  const cart = carts.find(c => c.id === cid);
  if (!cart) {
    res.status(404).json({ message: 'Carrito no encontrado' });
  } else {
    res.json(cart.products);
  }
});

cartsRouter.post('/:cid/product/:pid', (req, res) => {
  const { cid, pid } = req.params;
  const cart = carts.find(c => c.id === cid);
  if (!cart) {
    res.status(404).json({ message: 'Carrito no encontrado' });
  } else {
    const existingProduct = cart.products.find(p => p.product === pid);

    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    saveCartsToDatabase();

    res.status(201).json(cart);
  }
});

// Función para guardar los carritos en la base de datos
function saveCartsToDatabase() {
  fs.writeFileSync('carrito.json', JSON.stringify(carts, null, 2));
}

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
