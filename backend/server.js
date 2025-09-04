// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// carrega os produtos do JSON externo
const produtos = require("./data/produtos.json");

app.use("/logo", express.static(path.join(__dirname, "public/logo")));

// API
app.get("/api/produtos", (req, res) => {
  res.json(produtos);
});

// SERVE /images A PARTIR DE public/imagens 
app.use("/images", express.static(path.join(__dirname, "public/imagens")));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log("Servindo imagens de:", path.join(__dirname, "public/imagens"));
});
