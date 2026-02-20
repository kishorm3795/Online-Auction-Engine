#!/usr/bin/env python3
"""
Online Auction Engine - Server
TCP-based real-time bidding system
"""

import socket
import threading
import time
import sys

# Server configuration
HOST = '127.0.0.1'
PORT = 5555
BUFFER_SIZE = 1024

# Auction state
class AuctionState:
    def __init__(self):
        self.lock = threading.Lock()
        self.current_item = None
        self.current_item_index = 0
        self.highest_bid = 0
        self.highest_bidder = None
        self.auction_timer = 60  # seconds per item
        self.auction_end_time = None
        self.auction_active = False
        self.items = []
        self.clients = []  # List of (client_socket, client_address, client_name)

    def load_items(self, filename):
        """Load auction items from file"""
        try:
            with open(filename, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        parts = line.rsplit(',', 1)
                        if len(parts) == 2:
                            name, starting_price = parts[0], int(parts[1])
                            self.items.append({'name': name, 'starting_price': starting_price})
            return len(self.items) > 0
        except Exception as e:
            print(f"Error loading items: {e}")
            return False

    def start_auction(self):
        """Start the auction for current item"""
        with self.lock:
            if self.current_item_index < len(self.items):
                self.current_item = self.items[self.current_item_index]
                self.highest_bid = self.current_item['starting_price']
                self.highest_bidder = None
                self.auction_active = True
                self.auction_end_time = time.time() + self.auction_timer
                return True
            return False

    def place_bid(self, bidder_name, bid_amount):
        """Place a bid (thread-safe)"""
        with self.lock:
            if not self.auction_active:
                return False, "Auction is not active"
            
            if time.time() > self.auction_end_time:
                self.auction_active = False
                return False, "Auction time has ended"

            try:
                bid_amount = int(bid_amount)
            except ValueError:
                return False, "Invalid bid amount"

            if bid_amount <= self.highest_bid:
                return False, f"Bid must be higher than current highest bid: ₹{self.highest_bid}"

            self.highest_bid = bid_amount
            self.highest_bidder = bidder_name
            # Extend time slightly for competitive bidding
            self.auction_end_time = min(self.auction_end_time + 5, time.time() + self.auction_timer)
            return True, f"Bid accepted: ₹{bid_amount}"

    def get_status(self):
        """Get current auction status"""
        with self.lock:
            if not self.auction_active:
                if self.highest_bidder:
                    return (f"Item: {self.current_item['name']}\n"
                            f"Highest Bid: ₹{self.highest_bid}\n"
                            f"Winner: {self.highest_bidder}\n"
                            f"Status: AUCTION ENDED")
                else:
                    return "No active auction"

            time_left = max(0, int(self.auction_end_time - time.time()))
            return (f"Item: {self.current_item['name']}\n"
                    f"Highest Bid: ₹{self.highest_bid}\n"
                    f"Highest Bidder: {self.highest_bidder or 'No bids yet'}\n"
                    f"Time Left: {time_left} seconds\n"
                    f"Status: AUCTION LIVE")

    def next_item(self):
        """Move to next item"""
        with self.lock:
            self.current_item_index += 1
            if self.current_item_index < len(self.items):
                return True
            return False

    def broadcast(self, message, exclude_client=None):
        """Broadcast message to all connected clients"""
        with self.lock:
            for client_socket, _, client_name in self.clients:
                if client_socket != exclude_client:
                    try:
                        client_socket.send(message.encode())
                    except:
                        pass

auction_state = AuctionState()

def handle_client(client_socket, client_address):
    """Handle individual client connection"""
    client_name = None
    print(f"New connection from {client_address}")

    try:
        # Send welcome message
        client_socket.send("WELCOME TO ONLINE AUCTION ENGINE\n".encode())

        # Get client name
        client_socket.send("Enter your name: ".encode())
        client_name = client_socket.recv(BUFFER_SIZE).decode().strip()
        
        if not client_name:
            client_name = f"User_{client_address[1]}"

        # Register client
        with auction_state.lock:
            auction_state.clients.append((client_socket, client_address, client_name))

        # Send current auction status
        status = auction_state.get_status()
        client_socket.send(f"\n{status}\n".encode())

        # Main client loop
        while True:
            try:
                # Send prompt
                client_socket.send("\nEnter your bid (or 'status' to view, 'quit' to exit): ".encode())
                
                # Receive bid
                data = client_socket.recv(BUFFER_SIZE)
                if not data:
                    break

                message = data.decode().strip().lower()

                if message == 'quit':
                    client_socket.send("Goodbye!\n".encode())
                    break

                elif message == 'status':
                    status = auction_state.get_status()
                    client_socket.send(f"\n{status}\n".encode())

                elif message == 'next' or message == 'skip':
                    # Only server admin can skip (check IP)
                    if client_address[0] == '127.0.0.1':
                        if auction_state.next_item():
                            if auction_state.start_auction():
                                auction_state.broadcast("\n=== NEW AUCTION ITEM ===\n")
                                auction_state.broadcast(auction_state.get_status())
                            else:
                                auction_state.broadcast("All auctions completed!")
                        else:
                            client_socket.send("No more items\n".encode())
                    else:
                        client_socket.send("Only admin can skip items\n".encode())

                else:
                    # Try to parse as bid
                    try:
                        bid_amount = int(message)
                        success, msg = auction_state.place_bid(client_name, bid_amount)
                        client_socket.send(f"{msg}\n".encode())

                        if success:
                            # Broadcast update to all clients
                            update_msg = (f"\n*** NEW HIGH BID ***\n"
                                        f"Bidder: {client_name}\n"
                                        f"Amount: ₹{bid_amount}\n"
                                        f"Time remaining: {int(auction_state.auction_end_time - time.time())}s\n")
                            auction_state.broadcast(update_msg, exclude_client=client_socket)
                            # Send updated status to the bidder
                            client_socket.send(f"\n{auction_state.get_status()}\n".encode())

                    except ValueError:
                        client_socket.send("Invalid input. Enter a number or 'status'/'quit'\n".encode())

            except ConnectionResetError:
                break
            except Exception as e:
                print(f"Error handling client {client_name}: {e}")
                break

    except Exception as e:
        print(f"Client handler error: {e}")

    finally:
        # Remove client from list
        with auction_state.lock:
            auction_state.clients = [c for c in auction_state.clients if c[0] != client_socket]
        
        print(f"Client {client_name} disconnected")
        try:
            client_socket.close()
        except:
            pass

def auction_timer_thread():
    """Monitor auction timer and auto-advance"""
    while True:
        time.sleep(1)
        
        with auction_state.lock:
            if auction_state.auction_active and time.time() > auction_state.auction_end_time:
                # Auction ended
                auction_state.auction_active = False
                
                if auction_state.highest_bidder:
                    winner_msg = (f"\n{'='*40}\n"
                                 f"AUCTION ENDED!\n"
                                 f"Item: {auction_state.current_item['name']}\n"
                                 f"Winner: {auction_state.highest_bidder}\n"
                                 f"Winning Bid: ₹{auction_state.highest_bid}\n"
                                 f"{'='*40}\n")
                else:
                    winner_msg = (f"\n{'='*40}\n"
                                 f"AUCTION ENDED!\n"
                                 f"Item: {auction_state.current_item['name']}\n"
                                 f"No bids received!\n"
                                 f"{'='*40}\n")

                # Broadcast winner
                auction_state.broadcast(winner_msg)
                print(f"Auction ended: {auction_state.current_item['name']} - Winner: {auction_state.highest_bidder}")

                # Auto-advance to next item
                if auction_state.next_item():
                    time.sleep(2)
                    if auction_state.start_auction():
                        auction_state.broadcast("\n=== NEXT AUCTION ITEM ===\n")
                        auction_state.broadcast(auction_state.get_status())

def start_server():
    """Start the auction server"""
    # Load auction items
    if not auction_state.load_items('auction_items.txt'):
        print("Error: Could not load auction items")
        return

    # Create TCP socket
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((HOST, PORT))
    server_socket.listen(5)

    print(f"="*50)
    print("  ONLINE AUCTION ENGINE SERVER")
    print("="*50)
    print(f"Server listening on {HOST}:{PORT}")
    print(f"Loaded {len(auction_state.items)} auction items")
    print("="*50)

    # Start auction timer thread
    timer_thread = threading.Thread(target=auction_timer_thread, daemon=True)
    timer_thread.start()

    # Start first auction
    if auction_state.start_auction():
        print(f"\nFirst auction: {auction_state.current_item['name']}")
        print(f"Starting bid: ₹{auction_state.highest_bid}")
        print(f"Time per item: {auction_state.auction_timer} seconds\n")

    # Accept client connections
    try:
        while True:
            client_socket, client_address = server_socket.accept()
            client_thread = threading.Thread(
                target=handle_client,
                args=(client_socket, client_address),
                daemon=True
            )
            client_thread.start()
    except KeyboardInterrupt:
        print("\nServer shutting down...")
    except Exception as e:
        print(f"Server error: {e}")
    finally:
        server_socket.close()

if __name__ == "__main__":
    start_server()

