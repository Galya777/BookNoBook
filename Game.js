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
const modalActions = document.getElementById("modal-actions");
const modalContent = document.querySelector("#modal .modal-content");

let isOfferActive = false;
let isModalOpen = false;
let pendingOffer = null;
let lastOpenedImg = "";
let lastOpenedVal = 0;
let isGameOver = false;
let pendingSwap = false;

function playWinSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      const start = now + i * 0.18;
      const end = start + 0.35;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.5, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, end);
      o.start(start);
      o.stop(end + 0.02);
    });
  } catch (e) { /* ignore */ }
}

function clearConfetti() {
  if (!modalContent) return;
  const pieces = modalContent.querySelectorAll('.confetti');
  pieces.forEach(p => p.remove());
}

function spawnConfetti() {
  if (!modalContent) return;
  clearConfetti();
  const colors = ['#f5222d','#fa8c16','#faad14','#52c41a','#13c2c2','#1890ff','#722ed1','#eb2f96'];
  const count = 80;
  const width = modalContent.clientWidth || 500;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = Math.random() * (width - 10) + 'px';
    piece.style.top = (-Math.random() * 150 - 20) + 'px';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    const dur = 2.5 + Math.random() * 1.6;
    const delay = Math.random() * 0.5;
    piece.style.animationDuration = dur + 's';
    piece.style.animationDelay = delay + 's';
    modalContent.appendChild(piece);
  }
}

function showWinModal(title, message, imgSrc) {
  isOfferActive = false;
  pendingOffer = null;
  pendingSwap = false;
  isGameOver = true;
  modalText.innerHTML = `<div style="font-size:1.4rem;font-weight:700;">${title}</div><div style="margin-top:8px;">${message}</div>`;
  modalImg.src = imgSrc;
  modal.style.display = 'block';
  isModalOpen = true;

  modalActions.innerHTML = '';
  const playAgain = document.createElement('button');
  playAgain.textContent = 'Play Again';
  playAgain.onclick = () => location.reload();
  modalActions.appendChild(playAgain);

  // Hide close button during game over to force Play Again
  if (closeModal) closeModal.style.display = 'none';
  if (modalContent) modalContent.classList.add('win');
  spawnConfetti();
  playWinSound();
}

closeModal.onclick = () => {
  if (isOfferActive || isGameOver) return;
  modal.style.display = "none";
  isModalOpen = false;
  modalActions.innerHTML = "";
  if (modalContent) modalContent.classList.remove('win');
  clearConfetti();
  // After closing the content modal, show the banker offer or swap if pending
  if (pendingSwap) {
    showSwapOffer();
  } else if (pendingOffer !== null) {
    showBankerOffer();
  }
};

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function initGame() {
  caseValues = shuffle([...VALUES]);

  // 🎲 assign random prize images to each case
  caseImages = Array.from({length: NUM_CASES}, (_, i) => `Ibis_TBR/${i+1}.jpg`);
  shuffle(caseImages);

  cases = [];
  openedCases = 0;
  playerCaseIndex = null;
  isGameOver = false;
  pendingOffer = null;
  pendingSwap = false;
  if (closeModal) closeModal.style.display = '';

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
  if (isOfferActive || isModalOpen || isGameOver) return;
  if (playerCaseIndex === null) {
    // first click chooses player's case
    playerCaseIndex = index;
    document.getElementById("player-case").textContent =
      "Your Case: Case " + (index+1);
    el.classList.add("selected");
    el.textContent = "YOUR CASE";
    // Change the visual of the case to the selected image state
    // Using the same opened.jpg for a distinct look; alternatively, use a custom selected image if available
    el.style.pointerEvents = "none";
    return;
  }

  if (index === playerCaseIndex || el.classList.contains("opened")) return;

  el.classList.add("opened");
  const val = caseValues[index];
  const img = caseImages[index];
  lastOpenedVal = val;
  lastOpenedImg = img;

  // 🎁 Show modal with prize image + value
  modalImg.src = img;
  modalText.textContent = "This case contained: $" + val;
  modal.style.display = "block";
  isModalOpen = true;
  modalActions.innerHTML = "";

  markValue(val);
  openedCases++;

  if (openedCases % 3 === 0) {
    // Compute offer now, display after the content modal is closed
    const remaining = caseValues.filter((v, i) => i !== playerCaseIndex && !cases[i].classList.contains("opened"));
    if (remaining.length > 0) {
      const avg = remaining.reduce((a,b)=>a+b,0) / remaining.length;
      pendingOffer = Math.round(avg * 0.75);
      // Randomly decide to offer a swap instead of money offer
      pendingSwap = Math.random() < 0.35;
    }
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

// Bonus Manager adapted to JS
class BonusManager {
  constructor() {
    this.random = Math.random;
    this.multiplierBonusActive = Math.random() < 0.5;
    this.additiveBonusActive = Math.random() < 0.5;
    this.multiplierUsed = false;
    this.additiveUsed = false;
    this.multiplier = 1.0;
    this.additive = 0;
  }
  hasMultiplierBonus() { return this.multiplierBonusActive && !this.multiplierUsed; }
  hasAdditiveBonus() { return this.additiveBonusActive && !this.additiveUsed; }

  pickMultiplierOptions() {
    const options = [];
    for (let i = 0; i < 5; i++) {
      const q = Math.floor(Math.random() * 4) + 2; // 2–5
      const symbol = Math.random() < 0.5 ? '*' : '/';
      options.push(symbol + q);
    }
    return options;
  }
  pickAdditiveOptions() {
    const options = [];
    for (let i = 0; i < 10; i++) {
      const val = (Math.floor(Math.random() * 20) + 1) * 100; // 100–2000
      const symbol = Math.random() < 0.5 ? '+' : '-';
      options.push(symbol + val);
    }
    return options;
  }
  triggerMultiplierBonus() {
    if (!this.hasMultiplierBonus()) return null;
    const options = this.pickMultiplierOptions();
    this.multiplierUsed = true;
    // return chosen option (simulate selection via modal UI)
    return options;
  }
  triggerAdditiveBonus() {
    if (!this.hasAdditiveBonus()) return null;
    const options = this.pickAdditiveOptions();
    this.additiveUsed = true;
    return options;
  }
  applyBonuses(offer) {
    let modified = offer;
    if (this.multiplier !== 1.0) {
      modified = modified * this.multiplier;
      this.multiplier = 1.0;
    }
    if (this.additive !== 0) {
      modified = modified + this.additive;
      this.additive = 0;
    }
    return Math.max(1, Math.floor(modified));
  }
}

const bonuses = new BonusManager();

function renderBonusGrid(options, onPick) {
  const grid = document.createElement('div');
  grid.className = 'bonus-grid';
  options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.textContent = `Case ${i+1}`;
    btn.onclick = () => onPick(opt);
    grid.appendChild(btn);
  });
  return grid;
}

function showBankerOffer() {
  // Use pending offer if present; otherwise compute as fallback
  let offer = pendingOffer;
  if (offer === null) {
    const remaining = caseValues.filter((v, i) => i !== playerCaseIndex && !cases[i].classList.contains("opened"));
    if (remaining.length === 0) return;
    const avg = remaining.reduce((a,b)=>a+b,0) / remaining.length;
    offer = Math.round(avg * 0.75);
  }

  // If a swap was pending, divert to swap flow
  if (pendingSwap) {
    showSwapOffer();
    return;
  }

  // Prepare and show offer modal (separate from case content)
  isOfferActive = true;
  modalText.innerHTML = "📞 Banker offers: $" + offer;
  const randomIdx = Math.floor(Math.random() * caseImages.length);
  modalImg.src = caseImages[randomIdx];
  modal.style.display = "block";
  isModalOpen = true;

  modalActions.innerHTML = "";

  // Bonus integration (random application with reveal)
  if (bonuses.hasMultiplierBonus()) {
    const multiBtn = document.createElement('button');
    multiBtn.textContent = 'Use Multiplier Bonus';
    multiBtn.onclick = () => {
      const options = bonuses.triggerMultiplierBonus();
      if (!options) return;
      const choice = options[Math.floor(Math.random() * options.length)];
      if (choice.startsWith('*')) {
        const q = parseInt(choice.substring(1), 10);
        bonuses.multiplier = q;
      } else {
        const q = parseInt(choice.substring(1), 10);
        bonuses.multiplier = 1.0 / q;
      }
      const modified = bonuses.applyBonuses(offer);
      modalText.innerHTML = `📞 Banker offers: ${modified}<br><small>Bonus revealed: ${choice} applied.</small>`;
    };
    modalActions.appendChild(multiBtn);
  }

  if (bonuses.hasAdditiveBonus()) {
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Use Additive Bonus';
    addBtn.onclick = () => {
      const options = bonuses.triggerAdditiveBonus();
      if (!options) return;
      const choice = options[Math.floor(Math.random() * options.length)];
      if (choice.startsWith('+')) {
        bonuses.additive = parseInt(choice.substring(1), 10);
      } else {
        bonuses.additive = -parseInt(choice.substring(1), 10);
      }
      const modified = bonuses.applyBonuses(offer);
      modalText.innerHTML = `📞 Banker offers: ${modified}<br><small>Bonus revealed: ${choice} applied.</small>`;
    };
    modalActions.appendChild(addBtn);
  }

  // Deal/No Deal buttons
  const dealBtn = document.createElement("button");
  dealBtn.textContent = "Deal!";
  dealBtn.onclick = () => endGame(bonuses.applyBonuses(offer));
  const noDealBtn = document.createElement("button");
  noDealBtn.textContent = "No Deal";
  noDealBtn.onclick = () => {
    isOfferActive = false;
    pendingOffer = null;
    modal.style.display = "none";
    isModalOpen = false;
    modalActions.innerHTML = "";

    const bankerDiv = document.getElementById("banker-offer");
    if (bankerDiv) bankerDiv.style.display = "none";
    const actionsDiv = document.getElementById("actions");
    if (actionsDiv) actionsDiv.innerHTML = "";
  };
  modalActions.append(dealBtn, noDealBtn);

  const bankerDiv = document.getElementById("banker-offer");
  if (bankerDiv) {
    bankerDiv.style.display = "block";
    bankerDiv.textContent = "📞 Banker offers: $" + offer;
  }
}

function showSwapOffer() {
  isOfferActive = true;
  // Present swap offer UI
  modalText.innerHTML = `📞 The Banker offers to swap your case:<br><small>Swap your case with another unopened one?</small>`;
  modalImg.src = caseImages[Math.floor(Math.random() * caseImages.length)];
  modal.style.display = 'block';
  isModalOpen = true;
  modalActions.innerHTML = '';

  const swapBtn = document.createElement('button');
  swapBtn.textContent = 'Swap';
  const keepBtn = document.createElement('button');
  keepBtn.textContent = 'Keep my case';

  swapBtn.onclick = () => {
    // build choices of unopened cases (excluding player's)
    const choices = [];
    cases.forEach((c, i) => {
      if (i !== playerCaseIndex && !c.classList.contains('opened')) {
        choices.push(i);
      }
    });
    if (choices.length === 0) {
      modalText.innerHTML = 'Swap Not Possible<br><small>No unopened cases available to swap.</small>';
      modalActions.innerHTML = '';
      const ok = document.createElement('button');
      ok.textContent = 'Continue';
      ok.onclick = () => {
        isOfferActive = false;
        pendingOffer = null;
        pendingSwap = false;
        modal.style.display = 'none';
        isModalOpen = false;
      };
      modalActions.appendChild(ok);
      return;
    }

    // show a grid to pick a case to swap with
    const grid = document.createElement('div');
    grid.className = 'bonus-grid';
    choices.forEach(idx => {
      const btn = document.createElement('button');
      btn.textContent = 'Case ' + (idx + 1);
      btn.onclick = () => {
        performSwap(idx);
      };
      grid.appendChild(btn);
    });
    modalActions.innerHTML = '';
    const hint = document.createElement('div');
    hint.textContent = 'Choose another unopened case to swap with:';
    modalActions.appendChild(hint);
    modalActions.appendChild(grid);
  };

  keepBtn.onclick = () => {
    isOfferActive = false;
    pendingOffer = null;
    pendingSwap = false;
    modal.style.display = 'none';
    isModalOpen = false;
    modalActions.innerHTML = '';
  };

  modalActions.append(swapBtn, keepBtn);
}

function performSwap(newCaseIndex) {
  // Update visual states: new case becomes player's, old player's becomes active
  const oldIdx = playerCaseIndex;
  const oldEl = cases[oldIdx];
  const newEl = cases[newCaseIndex];

  if (!newEl || newEl.classList.contains('opened')) return;

  // Old player's case becomes active again
  if (oldEl) {
    oldEl.classList.remove('selected');
    oldEl.textContent = '';
    oldEl.style.pointerEvents = '';
  }
  // New becomes player's case
  newEl.classList.add('selected');
  newEl.textContent = 'YOUR CASE';
  newEl.style.pointerEvents = 'none';

  // Update player case index (no value swap to reflect actual case swap)
  playerCaseIndex = newCaseIndex;

  // Update the player case display text
  document.getElementById("player-case").textContent = "Your Case: Case " + (newCaseIndex + 1);

  modalText.innerHTML = `Swap Completed<br><small>Your new case is Case ${newCaseIndex + 1}</small>`;
  modalActions.innerHTML = '';
  const cont = document.createElement('button');
  cont.textContent = 'Continue';
  cont.onclick = () => {
    isOfferActive = false;
    pendingOffer = null;
    pendingSwap = false;
    modal.style.display = 'none';
    isModalOpen = false;
  };
  modalActions.appendChild(cont);
}

function showFinalReveal() {
  const otherIndex = cases.findIndex((c, i) => i !== playerCaseIndex && !c.classList.contains("opened"));
  const playerVal = caseValues[playerCaseIndex];
  const otherVal = caseValues[otherIndex];
  const msg = `You won ${playerVal}!<br><small>Your case had: ${playerVal}<br>Other case had: ${otherVal}</small>`;
  const img = caseImages[Math.floor(Math.random() * caseImages.length)];
  showWinModal('🎉 Congratulations!', msg, img);
}

function endGame(offer) {
  const playerVal = caseValues[playerCaseIndex];
  const msg = `You accepted the deal!<br>You win ${offer}.<br><small>Your case actually had ${playerVal}.</small>`;
  const img = caseImages[Math.floor(Math.random() * caseImages.length)];
  showWinModal('🎉 Congratulations!', msg, img);
}

initGame();
