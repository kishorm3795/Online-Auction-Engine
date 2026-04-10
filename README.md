# Online Auction Engine

## GITHUB LINK : https://github.com/kishorm3795/Online-Auction-Engine

## TEAM DETAILS
- Pavan Kishor M -- PES2UG24AM111
- Prajwalindra -- PES2UG24AM117
- Praveen Rajesh Naik -- PES2UG24AM123

A TCP-based real-time bidding system where multiple users can connect, view auction items, and place bids in real-time.

## Features

- **TCP Socket Communication**: Real-time bidirectional communication
- **Multi-client Support**: Multiple bidders can connect simultaneously using threading
- **Thread Safety**: Uses locks to ensure fair bid handling
- **Real-time Updates**: All clients see bid updates instantly
- **Auction Timer**: Configurable time limit per item
- **Auto-advance**: Automatically moves to next item when time expires
- **Fair Bidding**: First highest bid wins with thread-safe operations
- **Error Handling**: Handles client disconnects and invalid inputs gracefully
- **Web Interface**: Modern browser-based UI with real-time updates
- **REST API**: Programmatic access to auction data

## Project Structure

```
Online-Auction-Engine/
├── server.py                 # Original TCP server (CLI clients)
├── enhanced_server.py        # Enhanced web server (Flask + WebSocket)
├── client.py                 # CLI client
├── test_client.py            # Test client
├── demo.py                   # Demo script
├── generate_items.py         # Item generator
├── auction_items.txt         # Auction items data
├── requirements.txt          # Python dependencies
├── README.md                 # Project documentation
├── TODO.md                   # Task tracking
├── templates/
│   └── index.html           # Web interface template
└── static/
    ├── styles.css            # Styles
    └── app.js                # Frontend JavaScript
```

## How It Works

### Architecture

```
          SERVER
    (Auction Manager)
        /   |   \
    Client Client Client
```

### System Flow

```
Client connects
        ↓
Server accepts connection
        ↓
Client sends bid
        ↓
Server checks highest bid
        ↓
Update auction state
        ↓
Broadcast new highest bid to all clients
```

## Quick Start

1. **Install dependencies**: `pip install -r requirements.txt`
2. **Generate sample items**: `python generate_items.py` (optional)
3. **Start CLI server**: `python server.py`
4. **Or start web server**: `python enhanced_server.py`
5. **Connect CLI clients**: `python client.py`
6. **Or open web UI**: http://127.0.0.1:5000

## Detailed Setup & Running

### Prerequisites

- Python 3.x

### Auction Items

Edit `auction_items.txt`:
```
Item Name,Starting Price
```
Example:
```
Vintage Watch,500
Antique Vase,300
Gold Ring,1000
```

### CLI Mode

**Server**: `python server.py`

**Clients**: `python client.py` (multiple terminals)

```bash
python server.py
```

The server will:
- Load auction items from `auction_items.txt`
- Listen on `127.0.0.1:5555`
- Display loaded items and start the first auction

### Step 3: Connect Clients

In separate terminals, run:

```bash
python client.py
```

Each client will:
- Connect to the server
- Enter their name
- View current auction item and highest bid
- Place bids or check status

## Web Interface (New!)

The enhanced server provides a modern web-based interface:

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

Or manually:
```bash
pip install flask flask-socketio python-socketio eventlet
```

### Step 2: Start the Enhanced Server

```bash
python enhanced_server.py
```

The server will:
- Load auction items from `auction_items.txt`
- Start Flask web server on `http://127.0.0.1:5000`
- Provide WebSocket support for real-time updates

### Step 3: Open Web Interface

Open your browser and navigate to:
```
http://127.0.0.1:5000
```

### Web Features

- **Real-time bidding** with live updates
- **Quick bid buttons** for easy bidding
- **Activity feed** showing all bids
- **Timer display** with countdown
- **Responsive design** works on mobile and desktop

### REST API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Get current auction status |
| `/api/items` | GET | Get all auction items |
| `/api/bid` | POST | Place a bid (JSON: `{"bidder": "name", "amount": 100}`) |

### WebSocket Events

- `connect` - Client connected
- `disconnect` - Client disconnected
- `status_update` - Auction status changed
- `bid_update` - New bid placed
- `timer_update` - Timer countdown
- `auction_started` - New auction item started
- `auction_ended` - Auction item ended

## Client Commands

| Command | Description |
|---------|-------------|
| `status` | View current auction status |
| `next` / `skip` | Move to next item (admin only) |
| `quit` | Disconnect from server |
| `<number>` | Place a bid |

## Testing the System

1. Start the server in one terminal
2. Run 3+ clients in separate terminals
3. Have different clients place bids
4. Observe real-time updates across all clients
5. Watch the auction timer auto-advance

## Example Session

### Server Output:
```
==================================================
  ONLINE AUCTION ENGINE SERVER
==================================================
Server listening on 127.0.0.1:5555
Loaded 5 auction items
==================================================

First auction: Vintage Watch
Starting bid: $500
Time per item: 60 seconds
```

### Client Output:
```
Enter server IP (default: 127.0.0.1): 
Enter server port (default: 5555): 
Connected to auction server!
WELCOME TO ONLINE AUCTION ENGINE
Enter your name: John

Item: Vintage Watch
Highest Bid: $500
Highest Bidder: No bids yet
Time Left: 58 seconds
Status: AUCTION LIVE

Enter your bid (or 'status' to view, 'quit' to exit): 600
Bid accepted: ₹600

*** NEW HIGH BID ***
Bidder: John
Amount: ₹600
Time remaining: 55s
```

## Key Implementation Details

### Threading
Each client is handled in a separate thread, allowing concurrent connections and real-time bidding.

### Threading Lock
```python
threading.Lock()
```
Used to protect shared auction state when multiple clients bid simultaneously.

### Broadcast
When a new bid is placed, the server broadcasts the update to all connected clients:
```python
def broadcast(self, message, exclude_client=None):
    for client in self.clients:
        client.send(message)
```

### Auction Timer
A separate daemon thread monitors the auction timer and automatically:
- Ends the current auction when time expires
- Announces the winner
- Moves to the next item
- Starts a new auction







## License

MIT License
