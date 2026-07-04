// Shared clean logic
const TRACKERS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'gclsrc', 'dclid', 'msclkid',
  'twclid', 'ysclid', 'wickedid',
  'sc_campaign', 'sc_channel', 'sc_content', 'sc_medium', 'sc_outcome', 'sc_geo', 'sc_country',
  'ref', 'ref_src', 'ref_url', 'source',
  'si', 's_kwcid',
  'aff_id', 'affiliate', 'aff', 'campaign_id', 'cid',
  'mc_cid', 'mc_eid',
  'pk_source', 'pk_medium', 'pk_campaign', 'pk_keyword',
  'vgo_eo',
  'mrq', 'mrqri', 'mrqei', 'mrqrs',
  'sa', 'sei', 'srsltid',
];

function cleanUrl(url) {
  try {
    const u = new URL(url);
    let removed = 0;
    if (u.hash) { u.hash = ''; removed++; }
    for (const key of [...u.searchParams.keys()]) {
      if (TRACKERS.includes(key.toLowerCase())) {
        u.searchParams.delete(key);
        removed++;
      }
    }
    for (const key of [...u.searchParams.keys()]) {
      const val = u.searchParams.get(key);
      if (val === '' || val === null) {
        u.searchParams.delete(key);
        removed++;
      }
    }
    return { url: u.toString(), cleaned: removed > 0, removed };
  } catch (e) {
    return { url: null, cleaned: false, removed: 0 };
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const statusIcon = document.getElementById('statusIcon');
  const statusLabel = document.getElementById('statusLabel');
  const statusSub = document.getElementById('statusSub');
  const urlBox = document.getElementById('urlBox');
  const originalUrlEl = document.getElementById('originalUrl');
  const copyBtn = document.getElementById('copyBtn');
  const copiedMsg = document.getElementById('copiedMsg');
  const autoToggle = document.getElementById('autoToggle');
  const switchKnob = document.getElementById('switchKnob');
  const clickToggle = document.getElementById('clickToggle');
  const clickSwitch = document.getElementById('clickSwitch');
  const toastToggle = document.getElementById('toastToggle');
  const toastSwitch = document.getElementById('toastSwitch');
  const upgradeBtn = document.getElementById('upgradeBtn');
  const upgradeIcon = document.getElementById('upgradeIcon');
  const upgradeTitle = document.getElementById('upgradeTitle');
  const upgradeSub = document.getElementById('upgradeSub');
  const statsRow = document.getElementById('statsRow');
  const statCleaned = document.getElementById('statCleaned');
  const statTracking = document.getElementById('statTracking');

  // Track daily stats
  const today = new Date().toDateString();
  const stored = await chrome.storage.sync.get(['dailyCleaned', 'dailyTrackers', 'lastDate', 'autoClean', 'cleanOnClick', 'proLicense', 'showToasts']);
  
  let dailyCleaned = (stored.lastDate === today) ? (stored.dailyCleaned || 0) : 0;
  let dailyTrackers = (stored.lastDate === today) ? (stored.dailyTrackers || 0) : 0;

  // ─── Pro license gate ────────────────────────────────────────
  // Simplified: Pro is activated on the honor system via Stripe purchase.
  // User clicks "Upgrade to Pro", pays via Stripe, then clicks "Activate" here.
  let proEnabled = false;

  chrome.storage.sync.get(['proLicense'], (result) => {
    proEnabled = result.proLicense === true;
    upgradeBtn.onclick = () => {
      window.open('https://buy.stripe.com/test_14A9ASenPb2BdkR1Y15EY00', '_blank');
    };
    if (proEnabled) {
      upgradeTitle.textContent = 'Pro Active';
      upgradeSub.textContent = 'All features unlocked, thank you!';
      upgradeIcon.innerHTML = '&#10003;';
      upgradeIcon.style.background = 'rgba(34,197,94,0.15)';
    }
  });

  // Manual activation for existing purchasers
  upgradeBtn.addEventListener('dblclick', async () => {
    await chrome.storage.sync.set({ proLicense: true });
    upgradeTitle.textContent = 'Pro Active';
    upgradeSub.textContent = 'All features unlocked, thank you!';
    upgradeIcon.innerHTML = '&#10003;';
    upgradeIcon.style.background = 'rgba(34,197,94,0.15)';
  });
  
  const isActive = stored.autoClean !== false;
  switchKnob.classList.toggle('active', isActive);
  
  const clickActive = stored.cleanOnClick === true;
  clickSwitch.classList.toggle('active', clickActive);

  const toastActive = stored.showToasts !== false;
  toastSwitch.classList.toggle('active', toastActive);

  // Toggle auto-clean
  autoToggle.addEventListener('click', async () => {
    const nowActive = !switchKnob.classList.contains('active');
    switchKnob.classList.toggle('active');
    await chrome.storage.sync.set({ autoClean: nowActive });
  });

  // Toggle clean-on-click
  clickToggle.addEventListener('click', async () => {
    const nowActive = !clickSwitch.classList.contains('active');
    clickSwitch.classList.toggle('active');
    await chrome.storage.sync.set({ cleanOnClick: nowActive });
  });

  // Toggle toasts
  toastToggle.addEventListener('click', async () => {
    const nowActive = !toastSwitch.classList.contains('active');
    toastSwitch.classList.toggle('active');
    await chrome.storage.sync.set({ showToasts: nowActive });
  });

  function setStatusNeutral() {
    statusIcon.textContent = '\uD83D\uDD17';
    statusLabel.textContent = 'Ready';
    statusSub.textContent = 'Click a button to clean the current URL';
  }

  async function loadCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const original = tab.url;
      const result = cleanUrl(original);

      if (!result.url) {
        statusIcon.textContent = '\u274C';
        statusLabel.textContent = 'Cannot Read Page';
        statusSub.textContent = 'This page URL cannot be processed';
        return;
      }

      if (!result.cleaned) {
        statusIcon.textContent = '\u2705';
        statusLabel.textContent = 'Already Clean';
        statusSub.textContent = 'No tracking parameters found';
        copyBtn.disabled = true;
        return;
      }

      statusIcon.textContent = '\uD83E\uDDF9';
      statusLabel.textContent = `Cleaned: ${result.removed} tracking param${result.removed > 1 ? 's' : ''}`;
      statusSub.textContent = 'The clean URL is ready to copy';
      urlBox.style.display = 'block';
      originalUrlEl.textContent = original;
      copyBtn.disabled = false;

      copyBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(result.url);
          copiedMsg.style.display = 'block';
          setTimeout(() => { copiedMsg.style.display = 'none'; }, 2500);
        } catch (e) {
          statusLabel.textContent = '\u274C Copy Failed';
        }
      };

    } catch (e) {
      statusIcon.textContent = '\u274C';
      statusLabel.textContent = 'Error';
      statusSub.textContent = 'Could not read the current tab';
    }
  }

  // Update stats display
  statCleaned.textContent = dailyCleaned;
  statTracking.textContent = dailyTrackers;
  if (dailyCleaned > 0 || dailyTrackers > 0) {
    statsRow.style.display = 'flex';
  }

  loadCurrentTab();
});
