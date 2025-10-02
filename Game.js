const NUM_CASES = 26;
const VALUES = [
  1, 5, 10, 25, 50, 75, 100, 200,
  300, 400, 500, 750, 1000, 5000,
  10000, 12500, 25000, 50000, 75000,
  100000, 200000, 300000, 400000,
  500000, 750000, 1000000
];

let cases = [];
let caseValues = [];
let caseImages = [];
let playerCaseIndex = null;
let openedCases = 0;

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const modalText = document.getElementById("modal-text");
const closeModal = document.getElementById("close-modal");

closeModal.onclick = () => modal.style.display = "none";

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function initGame() {
  caseValues = shuffle([...VALUES]);

  // 🎲 assign random prize images to each case
  caseImages = Array.from({length: NUM_CASES}, (_, i) => `img/prizes/${i+1}.jpg`);
  shuffle(caseImages);

  const casesDiv = document.getElementById("cases");
  casesDiv.innerHTML = "";
  for (let i = 0; i < NUM_CASES; i++) {
    const c = document.createElement("div");
    c.classList.add("case");
    c.dataset.index = i;
    c.addEventListener("click", () => openCase(i, c));

    cases.push(c);
    casesDiv.appendChild(c);
  }

  // Sidebars
  const leftSidebar = document.getElementById("left-sidebar");
  const rightSidebar = document.getElementById("right-sidebar");
  leftSidebar.innerHTML = "";
  rightSidebar.innerHTML = "";
  for (let i = 0; i < VALUES.length; i++) {
    const label = document.createElement("div");
    label.classList.add("value");
    label.textContent = "$" + VALUES[i];
    if (i < VALUES.length/2) {
      leftSidebar.appendChild(label);
    } else {
      rightSidebar.appendChild(label);
    }
  }
}

function openCase(index, el) {
  if (playerCaseIndex === null) {
    // first click chooses player's case
    playerCaseIndex = index;
    document.getElementById("player-case").textContent =
      "Your Case: Case " + (index+1);
    el.classList.add("opened");
    return;
  }

  if (index === playerCaseIndex || el.classList.contains("opened")) return;

  el.classList.add("opened");
  const val = caseValues[index];
  const img = caseImages[index];

  // 🎁 Show modal with prize image + value
  modalImg.src = img;
  modalText.textContent = "This case contained: $" + val;
  modal.style.display = "block";

  markValue(val);
  openedCases++;

  if (openedCases % 3 === 0) {
    showBankerOffer();
  }

  if (getUnopenedCasesCount() === 1) {
    showFinalReveal();
  }
}

function markValue(val) {
  const labels = document.querySelectorAll(".value");
  labels.forEach(label => {
    if (label.textContent === "$" + val) {
      label.classList.add("opened");
    }
  });
}

function getUnopenedCasesCount() {
  return cases.filter(c => !c.classList.contains("opened")).length;
}

function showBankerOffer() {
  const remaining = caseValues.filter((v, i) => i !== playerCaseIndex && !cases[i].classList.contains("opened"));
  if (remaining.length === 0) return;
  let avg = remaining.reduce((a,b)=>a+b,0) / remaining.length;
  let offer = Math.round(avg * 0.75);

  const bankerDiv = document.getElementById("banker-offer");
  bankerDiv.style.display = "block";
  bankerDiv.textContent = "📞 Banker offers: $" + offer;

  const actionsDiv = document.getElementById("actions");
  actionsDiv.innerHTML = "";
  const dealBtn = document.createElement("button");
  dealBtn.textContent = "Deal!";
  dealBtn.onclick = () => endGame(offer);
  const noDealBtn = document.createElement("button");
  noDealBtn.textContent = "No Deal";
  noDealBtn.onclick = () => bankerDiv.style.display = "none";
  actionsDiv.append(dealBtn, noDealBtn);
}

function showFinalReveal() {
  const otherIndex = cases.findIndex((c, i) => i !== playerCaseIndex && !c.classList.contains("opened"));
  const playerVal = caseValues[playerCaseIndex];
  const otherVal = caseValues[otherIndex];
  alert("Final Reveal!\nYour case had: $" + playerVal + "\nOther case had: $" + otherVal);
}

function endGame(offer) {
  const playerVal = caseValues[playerCaseIndex];
  alert("You accepted the deal!\nYou win $" + offer + "\nYour case actually had $" + playerVal);
  location.reload();
}

initGame();
