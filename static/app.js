// Online Auction Engine - Frontend JavaScript

// Global variables
let socket = null;
let currentUser = '';
let isConnected = false;

// DOM Elements
const loginSection = document.getElementById('login-section');
const auctionSection = document.getElementById('auction-section');
const usernameInput = document.getElementById('username');
const joinBtn = document.getElementById('join-btn');
const userNameDisplay = document.getElementById('user-name');
const connectionStatus = document.getElementById('connection-status');
const itemName = document.getElementById('item-name');
const highestBid = document.getElementById('highest-bid');
const highestBidder = document.getElementById('highest-bidder');
const startingPrice = document.getElementById('starting-price');
const timer = document.getElementById('timer');
const timerProgress = document.getElementById('timer-progress');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const bidAmountInput = document.getElementById('bid-amount');
const placeBidBtn = document.getElementById('place-bid-btn');
const bidMessage = document.getElementById('bid-message');
const itemsGrid = document.getElementById('items-grid');
const activityFeed = document.getElementById('activity-feed');

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    joinBtn.addEventListener('click', joinAuction);
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') joinAuction();
    });
    placeBidBtn.addEventListener('click', placeBid);
    bidAmountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') placeBid();
    });
});

// Join Auction
function joinAuction() {
    const username = usernameInput.value.trim();
    if (!username) {
        showMessage('Please enter your name', 'error');
        return;
    }
    
    currentUser = username;
    userNameDisplay.textContent = currentUser;
    
    // Connect to WebSocket server
    connectToServer();
}

// Connect to WebSocket
function connectToServer() {
    // Determine WebSocket URL based on current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    socket = io(wsUrl, {
        transports: ['websocket', 'polling']
    });
    
    // Connection events
    socket.on('connect', () => {
        console.log('Connected to server');
        isConnected = true;
        updateConnectionStatus(true);
        
        // Show auction section
        loginSection.classList.add('hidden');
        auctionSection.classList.remove('hidden');
        
        // Request current status
        socket.emit('request_status');
        
        // Load all items
        loadItems();
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        isConnected = false;
        updateConnectionStatus(false);
    });
    
    // Status update
    socket.on('status_update', (data) => {
        updateAuctionStatus(data);
    });
    
    // Bid update
    socket.on('bid_update', (data) => {
        updateAuctionStatus(data.status);
        addActivity(`${data.bidder} placed a bid of ₹${data.amount}`, 'bid');
        showMessage(`New bid: ₹${data.amount} by ${data.bidder}`, 'success');
    });
    
    // Timer update
    socket.on('timer_update', (data) => {
        updateTimer(data.time_left);
    });
    
    // Auction started
    socket.on('auction_started', (data) => {
        updateAuctionStatus(data);
        addActivity(`New auction started: ${data.item}`, 'start');
    });
    
    // Auction ended
    socket.on('auction_ended', (data) => {
        updateAuctionStatus({
            item: data.item,
            highest_bid: data.winning_bid,
            highest_bidder: data.winner,
            status: 'ENDED',
            time_left: 0
        });
        addActivity(`Auction ended! Winner: ${data.winner} with ₹${data.winning_bid}`, 'end');
    });
    
    // All auctions completed
    socket.on('all_auctions_completed', (data) => {
        statusText.textContent = 'COMPLETED';
        statusIndicator.className = 'status-indicator ended';
        addActivity('All auctions completed!', 'end');
    });
}

// Update connection status
function updateConnectionStatus(connected) {
    if (connected) {
        connectionStatus.textContent = 'Connected';
        connectionStatus.className = 'status-badge connected';
    } else {
        connectionStatus.textContent = 'Disconnected';
        connectionStatus.className = 'status-badge disconnected';
    }
}

// Update auction status display
function updateAuctionStatus(data) {
    if (!data || !data.item) {
        itemName.textContent = 'No active auction';
        return;
    }
    
    itemName.textContent = data.item;
    highestBid.textContent = `₹${data.highest_bid}`;
    highestBidder.textContent = data.highest_bidder || '--';
    startingPrice.textContent = `₹${data.starting_price || data.highest_bid}`;
    
    // Update status indicator
    if (data.status === 'LIVE') {
        statusText.textContent = 'LIVE';
        statusIndicator.className = 'status-indicator live';
    } else if (data.status === 'ENDED') {
        statusText.textContent = 'ENDED';
        statusIndicator.className = 'status-indicator ended';
    } else {
        statusText.textContent = data.status;
        statusIndicator.className = 'status-indicator';
    }
    
    // Update timer
    updateTimer(data.time_left);
}

// Update timer display
function updateTimer(timeLeft) {
    if (timeLeft === undefined || timeLeft === null) {
        timer.textContent = '--:--';
        timerProgress.style.width = '0%';
        return;
    }
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Update progress bar
    const progress = (timeLeft / 60) * 100;
    timerProgress.style.width = `${progress}%`;
    
    // Urgent styling when less than 10 seconds
    if (timeLeft <= 10) {
        timer.classList.add('urgent');
    } else {
        timer.classList.remove('urgent');
    }
}

// Place bid
function placeBid() {
    const amount = parseInt(bidAmountInput.value);
    
    if (!amount || amount <= 0) {
        showMessage('Please enter a valid bid amount', 'error');
        return;
    }
    
    if (!isConnected) {
        showMessage('Not connected to server', 'error');
        return;
    }
    
    // Disable button during request
    placeBidBtn.disabled = true;
    
    // Send bid to server
    fetch('/api/bid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            bidder: currentUser,
            amount: amount
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            bidAmountInput.value = '';
            addActivity(`You bid ₹${amount}`, 'bid');
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('Error placing bid', 'error');
        console.error('Bid error:', error);
    })
    .finally(() => {
        placeBidBtn.disabled = false;
    });
}

// Quick bid function
function placeQuickBid(increment) {
    const currentHighest = parseInt(highestBid.textContent.replace('₹', '')) || 0;
    const newBid = currentHighest + increment;
    bidAmountInput.value = newBid;
    placeBid();
}

// Load all items
function loadItems() {
    fetch('/api/items')
        .then(response => response.json())
        .then(items => {
            renderItems(items);
        })
        .catch(error => {
            console.error('Error loading items:', error);
        });
}

// Render items grid
function renderItems(items) {
    itemsGrid.innerHTML = '';
    
    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        
        if (item.is_current) {
            itemCard.classList.add('current');
        }
        
        itemCard.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-price">₹${item.starting_price}</div>
        `;
        
        itemsGrid.appendChild(itemCard);
    });
}

// Add activity to feed
function addActivity(message, type = 'bid') {
    const now = new Date();
    const time = now.toLocaleTimeString();
    
    const activityItem = document.createElement('div');
    activityItem.className = `activity-item ${type}`;
    activityItem.innerHTML = `
        <div class="activity-message">${message}</div>
        <div class="activity-time">${time}</div>
    `;
    
    // Remove "no activity" message if present
    const noActivity = activityFeed.querySelector('.no-activity');
    if (noActivity) {
        noActivity.remove();
    }
    
    // Add to top of feed
    activityFeed.insertBefore(activityItem, activityFeed.firstChild);
    
    // Keep only last 20 items
    while (activityFeed.children.length > 20) {
        activityFeed.removeChild(activityFeed.lastChild);
    }
}

// Show message
function showMessage(message, type) {
    bidMessage.textContent = message;
    bidMessage.className = `message ${type}`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        bidMessage.textContent = '';
        bidMessage.className = 'message';
    }, 3000);
}

