// Socket.IO Connection
const socket = io();

// State management
let currentUser = "";
let auctionActive = false;
let currentItem = null;
let maxTime = 60;

// Icon Mapping for categories/items
const iconMap = {
    "Laptop": "💻", "Smartphone": "📱", "Watch": "⌚", "Headset": "🎧", "Drone": "🚁",
    "Comic": "📚", "Map": "🗺️", "Vase": "🏺", "Armor": "🛡️", "Katana": "⚔️",
    "Penthouse": "🏢", "Island": "🏝️", "Yacht": "🛥️", "Vineyard": "🍷",
    "Avatar": "🖼️", "Punk": "👾", "Art": "🎨", "Blueprint": "📐",
    "Car": "🏎️", "Mustang": "🚗", "Bike": "🏍️", "Sailboat": "⛵",
    "Jet": "🛩️", "Clock": "🕰️", "Phone": "☎️", "Trunk": "🧳",
    "default": "💎"
};

function getIcon(name) {
    for (let key in iconMap) {
        if (name.includes(key)) return iconMap[key];
    }
    return iconMap.default;
}

// Elements
const loginSection = document.getElementById('login-section');
const auctionSection = document.getElementById('auction-section');
const joinBtn = document.getElementById('join-btn');
const usernameInput = document.getElementById('username');
const userDisplay = document.getElementById('user-name');
const connectionStatus = document.getElementById('connection-status');
const itemsGrid = document.getElementById('items-grid');
const activityFeed = document.getElementById('activity-feed');
const bidMessage = document.getElementById('bid-message');

// --- Initialization ---

joinBtn.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (name) {
        currentUser = name;
        userDisplay.textContent = name;
        loginSection.classList.add('hidden');
        auctionSection.classList.remove('hidden');
        
        // Initial data fetch
        fetchItems();
        socket.emit('request_status');
    } else {
        alert("Please enter a valid identity.");
    }
});

// --- API Calls ---

async function fetchItems() {
    try {
        const response = await fetch('/api/items');
        const items = await response.json();
        renderItemsGrid(items);
    } catch (err) {
        console.error("Failed to fetch items:", err);
    }
}

function renderItemsGrid(items) {
    itemsGrid.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = `item-thumb ${item.is_current ? 'active' : ''}`;
        div.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 5px;">${getIcon(item.name)}</div>
            <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
            <div style="color: var(--accent-primary); font-weight: 600;">₹${item.starting_price}</div>
        `;
        itemsGrid.appendChild(div);
    });
}

// --- Socket Events ---

socket.on('connect', () => {
    connectionStatus.textContent = 'CONNECTED';
    connectionStatus.style.color = 'var(--success)';
});

socket.on('disconnect', () => {
    connectionStatus.textContent = 'DISCONNECTED';
    connectionStatus.style.color = 'var(--error)';
    connectionStatus.style.background = 'var(--disconnect-bg)';
});

socket.on('status_update', (status) => {
    updateAuctionUI(status);
});

socket.on('timer_update', (data) => {
    updateTimer(data.time_left);
});

socket.on('bid_update', (data) => {
    updateAuctionUI(data.status);
    addActivity(`New bid: ₹${data.amount} by ${data.bidder}`, 'bid');
    
    // Animate bid amount
    const bidEl = document.getElementById('highest-bid');
    bidEl.style.transform = 'scale(1.2)';
    setTimeout(() => bidEl.style.transform = 'scale(1)', 200);
});

socket.on('auction_ended', (data) => {
    addActivity(`Auction Ended: ${data.item} won by ${data.winner || 'Nobody'} for ₹${data.winning_bid}`, 'end');
    bidMessage.textContent = `Auction ended! Winner: ${data.winner || 'None'}`;
    bidMessage.style.color = 'var(--accent-primary)';
    fetchItems(); // Refresh catalog
});

socket.on('auction_started', (status) => {
    updateAuctionUI(status);
    addActivity(`New Auction Started: ${status.item}`, 'start');
    fetchItems(); // Refresh catalog
    bidMessage.textContent = "";
});

// --- UI Logic ---

function updateAuctionUI(status) {
    if (!status.item) {
        document.getElementById('item-name').textContent = "Waiting for next auction...";
        return;
    }

    currentItem = status;
    document.getElementById('item-name').textContent = status.item;
    document.getElementById('item-icon').textContent = getIcon(status.item);
    document.getElementById('starting-price').textContent = `₹${status.starting_price || status.highest_bid}`;
    document.getElementById('highest-bid').textContent = `₹${status.highest_bid}`;
    document.getElementById('highest-bidder').textContent = status.highest_bidder || "No bids yet";
    
    const statusText = document.getElementById('status-text');
    statusText.textContent = status.status;
    
    updateTimer(status.time_left);
}

function updateTimer(timeLeft) {
    const timerEl = document.getElementById('timer');
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerEl.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    // Update progress bar (assuming 60s max for now)
    const progressBar = document.getElementById('timer-progress');
    const percentage = (timeLeft / 60) * 100;
    progressBar.style.width = `${percentage}%`;
    
    if (timeLeft <= 10) {
        timerEl.style.color = 'var(--error)';
        progressBar.style.background = 'var(--error)';
    } else {
        timerEl.style.color = 'var(--text-primary)';
        progressBar.style.background = 'var(--accent-primary)';
    }
}

function addActivity(text, type) {
    const p = document.createElement('div');
    p.className = 'activity-item';
    
    let emoji = "🔹";
    if (type === 'bid') emoji = "💰";
    if (type === 'start') emoji = "🚀";
    if (type === 'end') emoji = "🏆";
    
    p.innerHTML = `<span style="margin-right: 10px;">${emoji}</span> ${text}`;
    
    if (activityFeed.querySelector('.no-activity')) {
        activityFeed.innerHTML = '';
    }
    
    activityFeed.prepend(p);
    
    // Keep only last 15 activities
    if (activityFeed.children.length > 15) {
        activityFeed.removeChild(activityFeed.lastChild);
    }
}

// --- Bidding ---

async function placeBid(amount) {
    if (!currentUser) return;
    
    try {
        const response = await fetch('/api/bid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bidder: currentUser,
                amount: amount
            })
        });
        
        const result = await response.json();
        bidMessage.textContent = result.message;
        bidMessage.style.color = result.success ? 'var(--success)' : 'var(--error)';
        
        if (result.success) {
            document.getElementById('bid-amount').value = '';
        }
    } catch (err) {
        bidMessage.textContent = "Error placing bid.";
        console.error(err);
    }
}

window.placeQuickBid = (extra) => {
    if (!currentItem) return;
    const newBid = currentItem.highest_bid + extra;
    placeBid(newBid);
};

document.getElementById('place-bid-btn').addEventListener('click', () => {
    const amount = parseInt(document.getElementById('bid-amount').value);
    if (!isNaN(amount)) {
        placeBid(amount);
    }
});
