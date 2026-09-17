# Online Auction Engine

## GITHUB LINK : https://github.com/kishorm3795/Online-Auction-Engine

## TEAM DETAILS
- Pavan Kishor M -- PES2UG24AM111
- Prajwalindra -- PES2UG24AM117
- Praveen Rajesh Naik -- PES2UG24AM123

A high-performance real-time bidding system featuring both a TCP socket architecture for CLI clients and an enhanced Flask + WebSocket web application with an interactive 3D UI.

---

## Features

- **TCP Socket Communication**: Low-latency bidirectional socket communication
- **Multi-client Support**: Multiple bidders can connect simultaneously using multithreading
- **Thread Safety**: Thread locks guarantee synchronized, race-condition-free bid processing
- **Real-time Broadcast**: Instant updates broadcasted to all connected clients
- **Auction Timer**: Configurable countdown timer per item with automatic extension for last-minute bids
- **Auto-advance**: Seamlessly moves to the next catalog item when time expires
- **Modern Web Interface**: Responsive UI powered by Three.js background, live feeds, audio cues, and quick-bid buttons
- **REST & WebSocket API**: Comprehensive endpoints for programmatic and real-time client interaction

---

## Project Structure

```
Online-Auction-Engine/
├── server.py                 # Original TCP server (CLI clients)
├── enhanced_server.py        # Enhanced web server (Flask + WebSocket)
├── client.py                 # CLI client
├── test_client.py            # Automated test client script
├── demo.py                   # Demo simulation script
├── generate_items.py         # Item catalog generator
├── auction_items.txt         # Auction items dataset
├── requirements.txt          # Python dependencies
├── README.md                 # Project documentation
├── templates/
│   └── index.html           # Modern Web interface template
└── static/
    ├── styles.css            # Custom CSS design system
    ├── app.js                # Frontend WebSocket and UI controller
    └── three_bg.js           # 3D interactive particle background
```

---

## How It Works

### Architecture

```
                    SERVER
               (Auction Manager)
             /        |        \
        CLI Client  Web Client  CLI Client
         (TCP 5555) (HTTP 8080) (TCP 5555)
```

### Bidding Flow

```
1. Client connects (CLI via TCP / Web via WebSocket)
2. Client receives current item, starting price, and timer
3. Client submits a bid
4. Server validates bid > current highest bid (Thread-safe)
5. Server updates highest bid, leading bidder, and extends timer
6. Server broadcasts real-time update to all connected clients
7. When timer hits 0: Server declares winner and advances to next item
```

---

## Quick Start

### 1. Prerequisites
- Python 3.8 or higher

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## Running the Application

### Option A: Modern Web Interface (Recommended)

1. **Start the Web Server**:
   ```bash
   python enhanced_server.py
   ```
   *The server initializes on `http://127.0.0.1:8080`.*

2. **Open the Web Application**:
   Navigate to [http://127.0.0.1:8080](http://127.0.0.1:8080) in your web browser.

3. **Features available in Web UI**:
   - Enter your bidder identity (press Enter or click Enter Now).
   - Live auction display with dynamic category icons.
   - Quick bid buttons (`+₹100`, `+₹500`, `+₹1k`, `+₹5k`) and manual bid input.
   - Live countdown timer with color alert when < 10 seconds remaining.
   - Live activity feed of bids and winners.
   - Catalog list showing all upcoming and current items.
   - Audio feedback toggle for bid events.

### Option B: CLI Mode (TCP Sockets)

1. **Start the TCP Server**:
   ```bash
   python server.py
   ```
   *Server listens on `127.0.0.1:5555`.*

2. **Start CLI Clients** (Open separate terminal windows):
   ```bash
   python client.py
   ```

3. **CLI Commands**:
   | Command | Description |
   |---------|-------------|
   | `<amount>` | Submit a bid amount (e.g., `5000`) |
   | `status` | Display current item, highest bid, and time left |
   | `next` / `skip` | Advance to next item (admin action) |
   | `quit` | Disconnect from server |

4. **Automated Test Client**:
   ```bash
   python test_client.py
   ```

---

## API Documentation

### REST API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Renders web auction dashboard |
| `/api/status` | GET | Returns current auction state, item, highest bid, and time left |
| `/api/items` | GET | Returns list of all catalog items and their starting prices |
| `/api/history` | GET | Returns list of all bids placed during the active session |
| `/api/health` | GET | Health check endpoint for uptime monitoring |
| `/api/bid` | POST | Submits a bid via JSON: `{"bidder": "Pavan", "amount": 1500}` |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Client → Server | Connects client socket and sends current status |
| `request_status` | Client → Server | Requests immediate auction status snapshot |
| `status_update` | Server → Client | Broadcasts full auction state |
| `bid_update` | Server → Client | Broadcasts newly accepted bid and updated status |
| `timer_update` | Server → Client | Broadcasts remaining seconds every second |
| `auction_started` | Server → Client | Signals start of a new item auction |
| `auction_ended` | Server → Client | Signals conclusion of auction with winner details |

---

## License

MIT License - Developed as part of Academic Project by PES University students.
