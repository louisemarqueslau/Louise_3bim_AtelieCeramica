const express = require('express');
const multer = require('multer');
const router = express.Router();

// Importação do Controller
const produtoController = require('../controllers/produtoController');

const upload = multer({ storage: multer.memoryStorage() });

// Certifique-se de que cada controller existe no produtoController.js
router.get('/', produtoController.listarProdutos);
router.get('/:id', produtoController.obterProduto);
router.post('/', produtoController.criarProduto);
router.put('/:id', produtoController.atualizarProduto);
router.delete('/:id', produtoController.deletarProduto);

// Upload de imagem
router.post('/upload/:id', upload.single('imagem'), produtoController.uploadImagem);

module.exports = router;