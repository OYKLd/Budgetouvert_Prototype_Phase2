// ══════════════════════════════════════════════════════════════
// DONNÉES
// ══════════════════════════════════════════════════════════════
const COMMUNES = {
  abobo:        { budget:4200, dep:1840, rec:2100, tx:247, pct:43.8 },
  yopougon:     { budget:6800, dep:2910, rec:3200, tx:389, pct:42.8 },
  bouake:       { budget:3100, dep:1020, rec:1400, tx:178, pct:32.9 },
  yamoussoukro: { budget:2400, dep:980,  rec:1100, tx:134, pct:40.8 },
  cocody:       { budget:5500, dep:2100, rec:2600, tx:312, pct:38.2 },
};

const CATEGORIES = [
  { name:"Infrastructure", pct:39, color:"#1A7A4A" },
  { name:"Éducation",      pct:26, color:"#2D9A64" },
  { name:"Santé",          pct:19, color:"#4CAF50" },
  { name:"Administration", pct:14, color:"#3D5A3E" },
  { name:"Marchés",        pct:2,  color:"#5DC96E" },
];

let transactions = [
  { id:1, date:"16/04/2026", desc:"Éclairage public Zone 4",       cat:"Infrastructure", type:"dep", montant:4750000,   hash:"0x3f8ac12e9b5d7a2e4c6f0b8d2a4e6c8f0a2b4d6e8c0a2b4d6e8c0a2b4d6e" },
  { id:2, date:"12/04/2026", desc:"Taxe foncière T1 2026",         cat:"Recette",        type:"rec", montant:87400000,  hash:"0xa1d709b4c3e8f2a7d5b9c1e4f6a8b2d4e7f9a1c3e5b8d0f2a4c6e8b0d2f4" },
  { id:3, date:"08/04/2026", desc:"Réhab. école primaire Km17",    cat:"Education",      type:"dep", montant:31200000,  hash:"0x6c2bf77a8e1d4c9a5b0e3f6a2b8d4e0c6a8f2b4d6e8c0a2b4d6e8c0a2b4d6" },
  { id:4, date:"01/04/2026", desc:"Dotation État — Avril",         cat:"Recette",        type:"rec", montant:340000000, hash:"0x9e4c12d3a7f2b8e4d6c0a2b4e6f8a0c2d4e6b8d0f2a4c6e8b0d2f4a6c8e0" },
  { id:5, date:"29/03/2026", desc:"Entretien voirie marché central",cat:"Infrastructure", type:"dep", montant:12850000,  hash:"0x2b9f8e01c4a7d3e9f5b1a6c8e2f4a0b6d8e0c2a4e6b8d0f2a4c6e8b0d2f4" },
  { id:6, date:"22/03/2026", desc:"Fournitures scolaires lot 3",   cat:"Education",      type:"dep", montant:8400000,   hash:"0x7a3dc490e2b6f8a4c0d2e4b6f8a0c2d4e6b8d0f2a4c6e8b0d2f4a6c8e0b2" },
  { id:7, date:"15/03/2026", desc:"Collecte taxes marchés",        cat:"Marches",        type:"rec", montant:24600000,  hash:"0x4f1eb23c8a6d4e2f0b8c6d4e2f0b8c6d4e2f0b8c6d4e2f0b8c6d4e2f0b8c6" },
  { id:8, date:"10/03/2026", desc:"Construction fontaine secteur 2",cat:"Infrastructure",type:"dep", montant:18700000,  hash:"0x1a9c4f82e6b0d4a8c2e6b0d4a8c2e6b0d4a8c2e6b0d4a8c2e6b0d4a8c2e6b" },
];

let currentFilter = "all";
let txType = "dep";
let walletAddress = null;
let provider = null;
let signer = null;
let currentCommune = "abobo";

// ══════════════════════════════════════════════════════════════
// WALLET
// ══════════════════════════════════════════════════════════════
async function connectWallet() {
  if (!window.ethereum) {
    showToast("error","MetaMask non détecté","Installez MetaMask sur Chrome pour utiliser la vraie blockchain Polygon Amoy.");
    return;
  }
  try {
    await window.ethereum.request({ method:"eth_requestAccounts" });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    walletAddress = await signer.getAddress();

    // Vérifier réseau Polygon Amoy (chainId = 80002)
    const network = await provider.getNetwork();
    if (network.chainId !== 80002n) {
      try {
        await window.ethereum.request({
          method:"wallet_switchEthereumChain",
          params:[{ chainId:"0x13882" }]
        });
      } catch(e) {
        // Ajouter le réseau si pas présent
        await window.ethereum.request({
          method:"wallet_addEthereumChain",
          params:[{
            chainId:"0x13882",
            chainName:"Polygon Amoy Testnet",
            nativeCurrency:{ name:"MATIC",symbol:"MATIC",decimals:18 },
            rpcUrls:["https://rpc-amoy.polygon.technology/"],
            blockExplorerUrls:["https://amoy.polygonscan.com/"]
          }]
        });
      }
    }

    const short = walletAddress.slice(0,6)+"..."+walletAddress.slice(-4);
    document.getElementById("wallet-label").textContent = short;
    document.getElementById("wallet-btn").classList.add("connected");
    document.getElementById("agent-addr").textContent = short;
    showToast("success","Wallet connecté","Polygon Amoy Testnet · "+short);
    startBlockPolling();
  } catch(e) {
    showToast("error","Connexion échouée", e.message || "Erreur inconnue");
  }
}

function startBlockPolling() {
  if (!provider) return;
  const tick = async () => {
    try {
      const bn = await provider.getBlockNumber();
      document.getElementById("block-num").textContent = bn.toLocaleString("fr-FR");
    } catch{}
  };
  tick();
  setInterval(tick, 12000);
}

// ══════════════════════════════════════════════════════════════
// SOUMISSION BLOCKCHAIN
// ══════════════════════════════════════════════════════════════
async function submitTransaction() {
  if (!walletAddress) {
    showToast("info","Wallet requis","Connectez MetaMask pour signer la transaction.");
    return;
  }

  const desc = document.getElementById("f-desc").value.trim();
  const montant = parseInt(document.getElementById("f-montant").value) || 0;
  const cat = document.getElementById("f-cat").value;
  const ref = document.getElementById("f-ref").value.trim();
  const prest = document.getElementById("f-prest").value.trim();
  const obs = document.getElementById("f-obs").value.trim();

  if (!desc || !montant) {
    showToast("error","Champs manquants","Remplissez au moins la description et le montant.");
    return;
  }

  // UI loading
  document.getElementById("submit-spinner").style.display = "block";
  document.getElementById("submit-icon").style.display = "none";
  document.getElementById("submit-label").textContent = "Signature en cours…";
  document.getElementById("btn-submit").disabled = true;
  document.getElementById("tx-loader").classList.add("show");
  document.getElementById("loader-step").textContent = "Signature avec MetaMask…";

  try {
    // Encoder les données en calldata (pas de smart contract deployé — on stocke en calldata)
    const payload = JSON.stringify({
      v:"1",
      app:"BudgetOuvert",
      commune: document.getElementById("commune-select").value,
      type: txType,
      desc, montant, cat, ref, prest, obs,
      ts: Date.now(),
    });
    const dataHex = "0x" + Array.from(new TextEncoder().encode(payload))
      .map(b => b.toString(16).padStart(2,"0")).join("");

    document.getElementById("loader-step").textContent = "Envoi sur Polygon Amoy…";

    const contractAddress = "0x77ab0b9406ec99fd341f1a356c581a85cc822917";
    
    const abi = [
      "function enregistrer(string memory data) public",
      "event TransactionEnregistree(address indexed sender, string data, uint256 timestamp)"
    ];

    const contract = new ethers.Contract(contractAddress, abi, signer);

    const tx = await contract.enregistrer(payload);
    await tx.wait();

    document.getElementById("loader-step").textContent = "En attente de confirmation…";
    const receipt = await tx.wait(1);

    // Succès
    document.getElementById("tx-loader").classList.remove("show");

    const hashShort = tx.hash.slice(0,10)+"…"+tx.hash.slice(-8);
    const explorerUrl = `https://amoy.polygonscan.com/tx/${tx.hash}`;

    document.getElementById("tx-result").style.display = "block";
    document.getElementById("tx-hash-display").innerHTML =
      `Hash : <a href="${explorerUrl}" target="_blank">${tx.hash}</a><br>` +
      `Bloc : #${receipt.blockNumber.toLocaleString("fr-FR")} · Gas utilisé : ${receipt.gasUsed.toLocaleString("fr-FR")}`;

    // Ajouter à la liste locale
    const now = new Date();
    const dateStr = now.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"});
    const newTx = {
      id: transactions.length + 1,
      date: dateStr,
      desc, cat,
      type: txType,
      montant,
      hash: tx.hash,
    };
    transactions.unshift(newTx);
    renderTransactions();

    // Update KPIs
    const comm = COMMUNES[currentCommune];
    if (txType === "dep") {
      comm.dep += montant / 1e6;
      comm.pct = (comm.dep / comm.budget * 100);
    } else {
      comm.rec += montant / 1e6;
    }
    comm.tx++;
    updateCommune(currentCommune);

    showToast("success","Transaction gravée !",`Bloc #${receipt.blockNumber} · ${hashShort}`);

    // Reset form
    document.getElementById("f-desc").value = "";
    document.getElementById("f-montant").value = "";
    document.getElementById("f-obs").value = "";

  } catch(e) {
    document.getElementById("tx-loader").classList.remove("show");
    if (e.code === 4001) {
      showToast("info","Transaction annulée","Vous avez refusé la signature.");
    } else {
      showToast("error","Erreur blockchain", e.message?.slice(0,120) || "Erreur inconnue");
    }
  } finally {
    document.getElementById("submit-spinner").style.display = "none";
    document.getElementById("submit-icon").style.display = "block";
    document.getElementById("submit-label").textContent = "Valider sur la blockchain";
    document.getElementById("btn-submit").disabled = false;
  }
}

// ══════════════════════════════════════════════════════════════
// UI HELPERS
// ══════════════════════════════════════════════════════════════
function switchTab(tab, el) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  if (tab === "agent") {
    document.getElementById("panel-agent").style.display = "flex";
    document.getElementById("panel-agent").style.flexDirection = "column";
    document.getElementById("panel-dashboard").style.display = "block";
  } else {
    document.getElementById("panel-agent").style.display = "none";
    document.getElementById("panel-dashboard").style.display = "block";
  }
}

function setType(t) {
  txType = t;
  document.getElementById("btn-dep").className = "type-btn" + (t==="dep" ? " active-dep" : "");
  document.getElementById("btn-rec").className = "type-btn" + (t==="rec" ? " active-rec" : "");
}

function updateCommune(v) {
  currentCommune = v;
  const d = COMMUNES[v];
  const fmt = (n) => n >= 1000 ? (n/1000).toFixed(1)+" Mds" : n+" M";
  document.getElementById("kpi-budget").textContent = fmt(d.budget);
  document.getElementById("kpi-dep").textContent = fmt(d.dep);
  document.getElementById("kpi-dep-pct").textContent = d.pct.toFixed(1)+" % du budget";
  document.getElementById("kpi-rec").textContent = fmt(d.rec);
  document.getElementById("kpi-rec-pct").textContent = "↑ "+(d.rec/d.budget*100).toFixed(1)+" % obj.";
  document.getElementById("kpi-tx").textContent = d.tx;
  const pct = d.pct.toFixed(1);
  document.getElementById("bp-pct").textContent = pct+" %";
  document.getElementById("bp-fill").style.width = pct+"%";
  document.getElementById("bp-mid").textContent = fmt(d.budget/2);
  document.getElementById("bp-max").textContent = fmt(d.budget);
}

function filterTx(f, btn) {
  currentFilter = f;
  document.querySelectorAll(".filter-chip").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderTransactions();
}

function renderTransactions() {
  const filtered = transactions.filter(t => {
    if (currentFilter === "all") return true;
    if (currentFilter === "dep") return t.type === "dep";
    if (currentFilter === "rec") return t.type === "rec";
    return t.cat === currentFilter;
  });

  const tbody = document.getElementById("tx-tbody");
  tbody.innerHTML = filtered.map((t, i) => {
    const hashShort = t.hash.slice(0,8)+"…"+t.hash.slice(-6);
    const isPolygon = t.hash.length === 66;
    const explorer = isPolygon ? `https://amoy.polygonscan.com/tx/${t.hash}` : null;
    const hashHtml = explorer
      ? `<a href="${explorer}" target="_blank">${hashShort}</a>`
      : hashShort;
    const isNew = i === 0 && t.id === transactions[0].id;
    return `<tr class="${isNew ? 'new-tx' : ''}">
      <td style="color:var(--muted);font-size:11px">${t.date}</td>
      <td style="font-weight:500;color:var(--cream)">${t.desc}</td>
      <td><span class="cat-tag">${t.cat}</span></td>
      <td><span class="${t.type==='dep'?'badge-dep':'badge-rec'}">${t.type==='dep'?'Dépense':'Recette'}</span></td>
      <td class="${t.type==='dep'?'amt-dep':'amt-rec'}" style="text-align:right">${t.type==='dep'?'−':'+'}${t.montant.toLocaleString("fr-FR")}</td>
      <td class="hash-cell">${hashHtml}</td>
    </tr>`;
  }).join("");
}

// ══════════════════════════════════════════════════════════════
// CHARTS
// ══════════════════════════════════════════════════════════════
function initCharts() {
  // Evolution mensuelle
  const ctxEvo = document.getElementById("chart-evolution").getContext("2d");
  new Chart(ctxEvo, {
    type:"line",
    data:{
      labels:["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"],
      datasets:[
        {
          label:"Dépenses",
          data:[120,185,210,310,null,null,null,null,null,null,null,null],
          borderColor:"#E05252",fill:true,
          backgroundColor:"rgba(224,82,82,.08)",
          tension:.4,pointRadius:4,pointBackgroundColor:"#E05252",
          borderWidth:2,
        },
        {
          label:"Recettes",
          data:[380,210,245,450,null,null,null,null,null,null,null,null],
          borderColor:"#5DC96E",fill:true,
          backgroundColor:"rgba(93,201,110,.08)",
          tension:.4,pointRadius:4,pointBackgroundColor:"#5DC96E",
          borderWidth:2,
        }
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      interaction:{intersect:false,mode:"index"},
      plugins:{
        legend:{
          labels:{color:"#5A6B5A",font:{size:11,family:"DM Sans"},boxWidth:12,padding:16}
        },
        tooltip:{
          backgroundColor:"#161D14",borderColor:"#1E2B1E",borderWidth:1,
          titleColor:"#C8D4C8",bodyColor:"#5A6B5A",
          callbacks:{
            label:(ctx)=>" "+ctx.dataset.label+": "+ctx.parsed.y?.toLocaleString("fr-FR")+" M FCFA"
          }
        }
      },
      scales:{
        x:{grid:{color:"rgba(30,43,30,.5)"},ticks:{color:"#5A6B5A",font:{size:10}}},
        y:{grid:{color:"rgba(30,43,30,.5)"},ticks:{color:"#5A6B5A",font:{size:10},callback:v=>v+"M"}}
      }
    }
  });

  // Top dépenses
  const list = document.getElementById("top-dep-list");
  list.innerHTML = CATEGORIES.map(c => `
    <div class="top-dep-item">
      <span class="top-dep-cat">${c.name}</span>
      <div class="top-dep-bar-wrap">
        <div class="top-dep-bar" style="width:${c.pct}%;background:${c.color}"></div>
      </div>
      <span class="top-dep-val">${c.pct} %</span>
    </div>
  `).join("");
}

// ══════════════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════════════
function showToast(type, title, msg) {
  const icons = {
    success:`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#5DC96E" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M6 10l3 3 5-5"/></svg>`,
    error:`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#E05252" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M7 7l6 6M13 7l-6 6"/></svg>`,
    info:`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#4A9EBA" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M10 9v5M10 7v.5"/></svg>`,
  };
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<div class="toast-icon">${icons[type]}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>`;
  document.getElementById("toast-container").appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  // Date par défaut
  document.getElementById("f-date").value = new Date().toISOString().split("T")[0];

  // Init tab agent (caché par défaut, dashboard visible)
  document.getElementById("panel-agent").style.display = "none";

  // Render
  updateCommune("abobo");
  renderTransactions();
  initCharts();

  // Auto-detect MetaMask
  if (window.ethereum) {
    window.ethereum.request({ method:"eth_accounts" }).then(accs => {
      if (accs.length > 0) connectWallet();
    });
  }
});
