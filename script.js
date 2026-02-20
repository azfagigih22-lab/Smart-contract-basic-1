
// ---- NAVBAR SCROLL ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.style.background = 'rgba(14,17,32,0.97)';
  } else {
    navbar.style.background = 'rgba(14,17,32,0.85)';
  }
});

// ---- SMOOTH SCROLL NAV ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ---- TOAST ----
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg, duration = 3500) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ---- RIPPLE EFFECT ----
function addRipple(btn, e) {
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// ---- CONNECT WALLET BUTTONS ----
let walletConnected = false;
const fakeAddress = '0xA3f...9Bc2';

function handleConnectWallet(btn, e) {
  addRipple(btn, e);
  if (!walletConnected) {
    btn.textContent = 'Connecting...';
    btn.disabled = true;
    setTimeout(() => {
      walletConnected = true;
      btn.textContent = fakeAddress;
      btn.style.fontSize = '0.78rem';
      document.getElementById('navConnectBtn').textContent = fakeAddress;
      document.getElementById('navConnectBtn').style.fontSize = '0.78rem';
      showToast('✓ Wallet connected: ' + fakeAddress);
    }, 1200);
  } else {
    showToast('Wallet already connected: ' + fakeAddress);
  }
}

document.getElementById('heroConnectBtn').addEventListener('click', function(e) {
  handleConnectWallet(this, e);
});
document.getElementById('navConnectBtn').addEventListener('click', function(e) {
  if (!walletConnected) {
    this.textContent = 'Connecting...';
    this.disabled = true;
    setTimeout(() => {
      walletConnected = true;
      this.textContent = fakeAddress;
      this.style.fontSize = '0.78rem';
      document.getElementById('heroConnectBtn').textContent = fakeAddress;
      document.getElementById('heroConnectBtn').style.fontSize = '0.78rem';
      showToast('✓ Wallet connected: ' + fakeAddress);
    }, 1200);
  }
});

// ---- START TRANSACTION ----
document.getElementById('heroStartBtn').addEventListener('click', function() {
  document.getElementById('send').scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => {
    document.getElementById('recipientInput').focus();
  }, 700);
});

// ---- SEND ETH LOGIC ----
const sendBtn       = document.getElementById('sendBtn');
const recipientInput = document.getElementById('recipientInput');
const amountInput   = document.getElementById('amountInput');
const statusText    = document.getElementById('statusText');
const recipientError = document.getElementById('recipientError');
const amountError   = document.getElementById('amountError');
const txBody        = document.getElementById('txBody');

function validateAddress(addr) {
  return addr.trim().startsWith('0x') && addr.trim().length >= 8;
}

function validateAmount(amt) {
  const n = parseFloat(amt);
  return !isNaN(n) && n > 0;
}

function clearErrors() {
  recipientError.textContent = '';
  amountError.textContent = '';
}

recipientInput.addEventListener('input', () => {
  if (recipientInput.value && !validateAddress(recipientInput.value)) {
    recipientError.textContent = 'Address must start with 0x';
  } else {
    recipientError.textContent = '';
  }
});

amountInput.addEventListener('input', () => {
  if (amountInput.value && !validateAmount(amountInput.value)) {
    amountError.textContent = 'Enter a valid positive amount';
  } else {
    amountError.textContent = '';
  }
});

sendBtn.addEventListener('click', function(e) {
  addRipple(this, e);
  clearErrors();

  const addr = recipientInput.value.trim();
  const amt  = amountInput.value.trim();
  let valid  = true;

  if (!addr) {
    recipientError.textContent = 'Recipient address is required';
    valid = false;
  } else if (!validateAddress(addr)) {
    recipientError.textContent = 'Invalid wallet address (must start with 0x)';
    valid = false;
  }

  if (!amt) {
    amountError.textContent = 'Amount is required';
    valid = false;
  } else if (!validateAmount(amt)) {
    amountError.textContent = 'Enter a valid positive amount';
    valid = false;
  }

  if (!valid) return;

  // Simulate send
  sendBtn.textContent = 'Sending...';
  sendBtn.classList.add('loading');
  statusText.textContent = 'Status: Broadcasting transaction...';
  statusText.className = 'status-text sending';

  setTimeout(() => {
    sendBtn.textContent = '✓ Sent!';
    statusText.textContent = 'Status: Transaction Confirmed ✓';
    statusText.className = 'status-text success';
    showToast(`✓ Sent ${parseFloat(amt).toFixed(2)} ETH to ${addr.slice(0,6)}...${addr.slice(-4)}`);

    // Add to transaction table
    const shortFrom = '0x' + randomHex(4) + '.....' + randomHex(4);
    const shortTo   = addr.slice(0,6) + '....' + addr.slice(-4);
    const ethAmt    = parseFloat(amt).toFixed(1) + ' ETH';
    addTxRow(shortFrom, shortTo, ethAmt);

    setTimeout(() => {
      sendBtn.textContent = 'Send ETH';
      sendBtn.classList.remove('loading');
      statusText.textContent = 'Status: Ready to Send';
      statusText.className = 'status-text';
      recipientInput.value = '';
      amountInput.value    = '';
    }, 3000);
  }, 1800);
});

function randomHex(len) {
  const chars = '0123456789abcdefABCDEF';
  return Array.from({length: len}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function addTxRow(from, to, amount) {
  const tr = document.createElement('tr');
  tr.className = 'tx-row';
  tr.innerHTML = `
    <td class="addr">${from}</td>
    <td class="arrow-cell"><span class="tx-arrow">&#8594;</span></td>
    <td class="addr">${to}</td>
    <td class="amount">${amount}</td>
  `;
  tr.style.animationDelay = '0s';
  txBody.insertBefore(tr, txBody.firstChild);
}

// ---- SOLIDITY FILE HANDLING ----
const solidityFileInput = document.getElementById('solidityFileInput');
const solidityCodeInput = document.getElementById('solidityCodeInput');
const deployBtn = document.getElementById('deployBtn');
const deployStatus = document.getElementById('deployStatus');
const fileError = document.getElementById('fileError');
const codeError = document.getElementById('codeError');

// Handle file upload
solidityFileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    if (!file.name.endsWith('.sol')) {
      fileError.textContent = 'Only .sol files are allowed';
      return;
    }
    fileError.textContent = '';
    const reader = new FileReader();
    reader.onload = function(event) {
      solidityCodeInput.value = event.target.result;
      codeError.textContent = '';
      showToast('✓ Solidity file loaded');
    };
    reader.onerror = function() {
      fileError.textContent = 'Error reading file';
    };
    reader.readAsText(file);
  }
});

// Handle code input validation
solidityCodeInput.addEventListener('input', function() {
  if (this.value.trim()) {
    codeError.textContent = '';
  }
});

// Handle deploy button
deployBtn.addEventListener('click', function(e) {
  addRipple(this, e);
  fileError.textContent = '';
  codeError.textContent = '';

  const code = solidityCodeInput.value.trim();
  
  if (!code) {
    codeError.textContent = 'Please enter or upload Solidity code';
    return;
  }

  if (!code.includes('contract') && !code.includes('pragma')) {
    codeError.textContent = 'Invalid Solidity code - missing contract or pragma';
    return;
  }

  // Simulate deployment
  deployBtn.textContent = 'Deploying...';
  deployBtn.classList.add('loading');
  deployStatus.textContent = 'Status: Compiling and deploying contract...';
  deployStatus.className = 'status-text sending';

  setTimeout(() => {
    const contractAddress = '0x' + randomHex(8) + randomHex(8) + randomHex(8) + randomHex(8);
    deployBtn.textContent = '✓ Deployed!';
    deployStatus.textContent = `Status: Contract deployed at ${contractAddress}`;
    deployStatus.className = 'status-text success';
    showToast(`✓ Smart contract deployed successfully!`);

    setTimeout(() => {
      deployBtn.textContent = 'Deploy Contract';
      deployBtn.classList.remove('loading');
      deployStatus.textContent = 'Status: Ready to Deploy';
      deployStatus.className = 'status-text';
    }, 3000);
  }, 2500);
});

// ---- INTERSECTION OBSERVER for section animations ----
const observerOpts = { threshold: 0.12 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOpts);

document.querySelectorAll('.step, .feature-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});