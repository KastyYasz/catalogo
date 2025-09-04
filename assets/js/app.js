// assets/js/app.js
// Catálogo com carrossel, carrinho no header, modal de checkout, observações extras e WhatsApp.

// ------------ Config ------------
const API_URL = "http://localhost:3000/api/produtos";
const WHATSAPP_NUMBER = "551636336445"; // ajuste para o seu número (55 + DDD + número), sem + ou traços

// ------------ Estado ------------
let produtosCache = [];
let cart = []; // [{ name, price, qty }]

// ------------ Elementos ------------
const productListEl   = document.getElementById("product-list");
const searchInputEl   = document.getElementById("search-input");
const cartButtonEl    = document.getElementById("cart-button");
const cartCountEl     = document.getElementById("cart-count");

const overlayEl       = document.getElementById("cart-modal-overlay");
const closeModalEl    = document.getElementById("close-cart-modal");
const keepBuyingEl    = document.getElementById("keep-buying");
const finalizeBtnEl   = document.getElementById("finalize-whatsapp");
const modalItemsEl    = document.getElementById("modal-cart-items");
const modalSubtotalEl = document.getElementById("modal-subtotal");
const nomeEl          = document.getElementById("cliente-nome");
const cepEl           = document.getElementById("cliente-cep");
const notaEl          = document.getElementById("cliente-nota");
const formErrorEl     = document.getElementById("form-error");

// ------------ Utils ------------
function formatBRL(v){ return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}) }
function saveCart(){ localStorage.setItem("palhacaria:cart", JSON.stringify(cart)) }
function loadCart(){ cart = JSON.parse(localStorage.getItem("palhacaria:cart") || "[]") }
function totalQty(){ return cart.reduce((s,i)=>s+i.qty,0) }
function subtotal(){ return cart.reduce((s,i)=>s+i.price*i.qty,0) }
function normalizeCEP(v){ const d=v.replace(/\D/g,""); return d.length===8 ? `${d.slice(0,5)}-${d.slice(5)}` : v }
function isValidCEP(v){ return /^\d{5}-?\d{3}$/.test(v) }

// ------------ Produtos / Carrossel ------------
function escapeAttrJson(obj){ return JSON.stringify(obj).replace(/"/g,"&quot;") }
function getImagesArray(p){
  if (Array.isArray(p.imagens) && p.imagens.length) return p.imagens;
  if (p.imagem) return [p.imagem];
  return ["/images/placeholder.jpg"];
}

function cardHTML(p){
  const imgs = getImagesArray(p);
  const dataImgs = escapeAttrJson(imgs);

  // IDs que precisam de imagem contida (não cortar)
  const idsComFotoGrande = [3, 4, 5 ,6, 7,8,9,10,11,12,13,14];
  const imgFitClass = idsComFotoGrande.includes(p.id)
    ? "object-contain p-2"   // imagem “inteira” dentro do mesmo retangulo
    : "object-cover";        // padrão: corta para preencher

  return `
    <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      <!-- CONTAINER com altura fixa igual pra todos -->
      <div class="relative group rounded-md overflow-hidden aspect-[4/5] mb-4 bg-white">
        <img
          src="${imgs[0]}"
          alt="${p.nome}"
          loading="lazy"
          class="w-full h-full ${imgFitClass} carousel-img"
        />

        <!-- Controles -->
        <button
          class="hidden group-hover:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 border prev-img">‹</button>
        <button
          class="hidden group-hover:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 border next-img">›</button>

        <!-- Dots -->
        <div class="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          ${imgs.map((_,i)=>`<span class="inline-block w-2 h-2 rounded-full bg-white/80 ring-1 ring-black/10 dot ${i===0?"opacity-100":"opacity-50"}"></span>`).join("")}
        </div>

        <!-- Estado do carrossel -->
        <div class="hidden carousel-state" data-images="${dataImgs}" data-index="0"></div>
      </div>

      <h2 class="text-lg font-semibold">${p.nome}</h2>
      <p class="text-gray-600">${p.descricao || ""}</p>
      <span class="block mt-2 font-bold text-blue-600">R$ ${p.preco.toFixed(2).replace(".",",")}</span>
      <button class="mt-3 w-full rounded-lg border px-3 py-2 hover:bg-gray-50 add-to-cart"
              data-name="${p.nome}" data-price="${p.preco}">
        Adicionar ao carrinho
      </button>
    </div>
  `;
}


function setupCarousels(){
  document.querySelectorAll(".carousel-state").forEach(stateEl=>{
    const container = stateEl.closest(".relative");
    const imgEl = container.querySelector(".carousel-img");
    const prev = container.querySelector(".prev-img");
    const next = container.querySelector(".next-img");
    const dots = Array.from(container.querySelectorAll(".dot"));
    const imgs = JSON.parse(stateEl.dataset.images.replace(/&quot;/g,'"'));
    let idx = parseInt(stateEl.dataset.index,10) || 0;

    function render(){
      imgEl.src = imgs[idx];
      dots.forEach((d,i)=>{
        d.classList.toggle("opacity-100", i===idx);
        d.classList.toggle("opacity-50", i!==idx);
      });
      stateEl.dataset.index = String(idx);
    }
    prev?.addEventListener("click", e=>{ e.preventDefault(); idx=(idx-1+imgs.length)%imgs.length; render(); });
    next?.addEventListener("click", e=>{ e.preventDefault(); idx=(idx+1)%imgs.length; render(); });
    dots.forEach((d,i)=>{ d.style.cursor="pointer"; d.addEventListener("click",()=>{ idx=i; render(); }); });

    render();
  });
}

function renderProdutos(lista){
  productListEl.innerHTML = lista.map(cardHTML).join("");
  document.querySelectorAll(".add-to-cart").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      addToCart(btn.dataset.name, parseFloat(btn.dataset.price));
    });
  });
  setupCarousels();
}

async function carregarProdutos(){
  const res = await fetch(API_URL);
  const dados = await res.json();
  produtosCache = dados;
  renderProdutos(produtosCache);
}

function filtrarProdutos(q){
  q = q.toLowerCase();
  const f = produtosCache.filter(p =>
    p.nome.toLowerCase().includes(q) ||
    (p.descricao||"").toLowerCase().includes(q)
  );
  renderProdutos(f);
}

// ------------ Carrinho ------------
function addToCart(name, price){
  const found = cart.find(i=>i.name===name && i.price===price);
  if (found) found.qty += 1;
  else cart.push({ name, price, qty: 1 });
  saveCart();
  renderBadge();
}
function renderBadge(){ cartCountEl.textContent = String(totalQty()); }

// ------------ Modal ------------
function openCartModal(){
  renderCartModal();
  overlayEl.classList.remove("hidden");
  setTimeout(()=>nomeEl.focus(),0);
}
function closeCartModal(){ overlayEl.classList.add("hidden"); }

function renderCartModal(){
  modalItemsEl.innerHTML = "";
  cart.forEach((item,idx)=>{
    const itemSub = item.price*item.qty;
    const li = document.createElement("li");
    li.className = "flex items-center justify-between border rounded-lg p-2";
    li.innerHTML = `
      <div class="flex-1">
        <div class="font-medium">${item.name}</div>
        <div class="text-sm text-gray-600">${formatBRL(item.price)} un.</div>
      </div>
      <div class="flex items-center gap-2">
        <button data-idx="${idx}" class="qty-dec border rounded px-2 py-1" aria-label="Diminuir">−</button>
        <span class="w-6 text-center">${item.qty}</span>
        <button data-idx="${idx}" class="qty-inc border rounded px-2 py-1" aria-label="Aumentar">+</button>
        <span class="w-24 text-right font-medium">${formatBRL(itemSub)}</span>
        <button data-idx="${idx}" class="remove-item text-red-600 hover:underline ml-2">remover</button>
      </div>
    `;
    modalItemsEl.appendChild(li);
  });
  modalSubtotalEl.textContent = formatBRL(subtotal());

  modalItemsEl.querySelectorAll(".qty-inc").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const i = parseInt(btn.dataset.idx,10);
      cart[i].qty += 1;
      saveCart(); renderBadge(); renderCartModal();
    });
  });
  modalItemsEl.querySelectorAll(".qty-dec").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const i = parseInt(btn.dataset.idx,10);
      cart[i].qty -= 1;
      if (cart[i].qty<=0) cart.splice(i,1);
      saveCart(); renderBadge(); renderCartModal();
    });
  });
  modalItemsEl.querySelectorAll(".remove-item").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const i = parseInt(btn.dataset.idx,10);
      cart.splice(i,1);
      saveCart(); renderBadge(); renderCartModal();
    });
  });
}

// ------------ WhatsApp ------------
function buildWhatsAppMessage(nome, cep, nota){
  const linhas = cart.map((item,idx)=>{
    const sub = item.price*item.qty;
    return `${idx+1}) ${item.name} x${item.qty} - ${formatBRL(item.price)} = ${formatBRL(sub)}`;
  }).join("\n");

  const subFmt = formatBRL(subtotal());
  const cepFmt = cep || "não informado";
  const nomeFmt = nome || "Cliente";

  let msg =
    `Pedido - ${nomeFmt}\n` +
    `CEP: ${cepFmt}\n\n` +
    `Itens:\n${linhas}\n\n` +
    `Subtotal: ${subFmt}\n` +
    `Frete: a combinar\n` +
    `Total: ${subFmt}\n`;

  if (nota && nota.trim().length > 0){
    msg += `\nObservações: ${nota.trim()}\n`;
  }

  return msg;
}

function finalizeOrder(){
  if (!cart.length){ alert("Seu carrinho está vazio."); return; }
  let nome = (nomeEl.value||"").trim();
  let cep  = (cepEl.value ||"").trim();
  let nota = (notaEl.value||"").trim();
  cep = normalizeCEP(cep);

  const ok = nome.length>=2 && isValidCEP(cep);
  if (!ok){ formErrorEl.classList.remove("hidden"); return; }
  formErrorEl.classList.add("hidden");

  const msg = buildWhatsAppMessage(nome, cep, nota);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

// ------------ Eventos ------------
cartButtonEl.addEventListener("click", openCartModal);
closeModalEl.addEventListener("click", closeCartModal);
keepBuyingEl.addEventListener("click", closeCartModal);
overlayEl.addEventListener("click", e=>{ if (e.target===overlayEl) closeCartModal(); });
document.addEventListener("keydown", e=>{ if (e.key==="Escape") closeCartModal(); });
finalizeBtnEl.addEventListener("click", finalizeOrder);

searchInputEl.addEventListener("input", e=> filtrarProdutos(e.target.value));

// ------------ Boot ------------
loadCart();
renderBadge();
carregarProdutos().catch(err=>console.error("Erro ao carregar produtos:", err));
