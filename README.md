# Online Auction Engine

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

## Project Structure

```
Auction_Project/
├── server.py          # Main auction server
├── client.py          # Client application for bidders
├── auction_items.txt  # List of auction items
└── README.md          # This file
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

## Setup & Running

### Prerequisites

- Python 3.x installed

### Step 1: Prepare Auction Items

Edit `auction_items.txt` to add your items:

```
Item Name,Starting Price
```

Example:
```
Vintage Watch,500
Antique Vase,300
Gold Ring,1000
```

### Step 2: Start the Server

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
Starting bid: ₹500
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
Highest Bid: ₹500
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

>>>>>>> ca52387 (verify the code)
