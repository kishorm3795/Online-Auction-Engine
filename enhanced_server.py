#!/usr/bin/env python3
"""
Online Auction Engine - Enhanced Server
Flask REST API + WebSocket for real-time bidding
"""

import json
import threading
import time
import random
from flask import Flask, request, jsonify, render_template
from flask_socketio import SocketIO, emit

# Server configuration
HOST = '127.0.0.1'
PORT = 5555
WEB_PORT = 5000

# Flask app setup
app = Flask(__name__)
app.config['SECRET_KEY'] = 'auction-secret-key-2024'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

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
        self.bid_history = []  # Track all bids for this session

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
                return False, f"Bid must be higher than ₹{self.highest_bid}"

            self.highest_bid = bid_amount
            self.highest_bidder = bidder_name
            # Extend time slightly for competitive bidding
            self.auction_end_time = min(self.auction_end_time + 10, time.time() + self.auction_timer)
            
            # Add to bid history
            self.bid_history.append({
                'bidder': bidder_name,
                'amount': bid_amount,
                'item': self.current_item['name'],
                'timestamp': time.time()
            })
            
            return True, f"Bid accepted: ₹{bid_amount}"



    def get_status(self):
        """Get current auction status"""
        with self.lock:
            if not self.auction_active:
                if self.current_item:
                    return {
                        'item': self.current_item['name'],
                        'highest_bid': self.highest_bid,
                        'highest_bidder': self.highest_bidder,
                        'status': 'ENDED',
                        'time_left': 0
                    }
                else:
                    return {
                        'item': None,
                        'highest_bid': 0,
                        'highest_bidder': None,
                        'status': 'NO_AUCTION',
                        'time_left': 0
                    }

            time_left = max(0, int(self.auction_end_time - time.time()))
            return {
                'item': self.current_item['name'],
                'highest_bid': self.highest_bid,
                'highest_bidder': self.highest_bidder,
                'status': 'LIVE',
                'time_left': time_left,
                'starting_price': self.current_item['starting_price']
            }

    def get_all_items(self):
        """Get all auction items"""
        with self.lock:
            items = []
            for i, item in enumerate(self.items):
                items.append({
                    'name': item['name'],
                    'starting_price': item['starting_price'],
                    'is_current': i == self.current_item_index
                })
            return items

    def next_item(self):
        """Move to next item"""
        with self.lock:
            self.current_item_index += 1
            if self.current_item_index < len(self.items):
                return True
            return False

auction_state = AuctionState()

# ================== REST API Routes ==================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/status')
def get_status_api():
    return jsonify(auction_state.get_status())

@app.route('/api/items')
def get_items_api():
    return jsonify(auction_state.get_all_items())

@app.route('/api/bid', methods=['POST'])
def place_bid_api():
    data = request.get_json()
    if not data or 'bidder' not in data or 'amount' not in data:
        return jsonify({'success': False, 'message': 'Missing data'}), 400
    
    success, message = auction_state.place_bid(data['bidder'], data['amount'])
    if success:
        socketio.emit('bid_update', {
            'bidder': data['bidder'],
            'amount': data['amount'],
            'status': auction_state.get_status()
        })
    return jsonify({'success': success, 'message': message})

# ================== WebSocket Events ==================

@socketio.on('connect')
def handle_connect():
    emit('status_update', auction_state.get_status())

@socketio.on('request_status')
def handle_status_request():
    emit('status_update', auction_state.get_status())

# ================== Background Threads ==================

def auction_timer_thread():
    while True:
        socketio.sleep(1)
        


        # Check if auction has ended
        should_end = False
        winner_data = None
        
        with auction_state.lock:
            if auction_state.auction_active and time.time() > auction_state.auction_end_time:
                auction_state.auction_active = False
                should_end = True
                winner_data = {
                    'item': auction_state.current_item['name'],
                    'winner': auction_state.highest_bidder,
                    'winning_bid': auction_state.highest_bid,
                    'status': 'ENDED'
                }
        
        # Emit events outside the lock
        if should_end:
            socketio.emit('auction_ended', winner_data)
            print(f"Auction ended: {winner_data['item']} - Winner: {winner_data['winner']}")
            
            # Move to next item
            if auction_state.next_item():
                socketio.sleep(3)
                if auction_state.start_auction():
                    print(f"New auction started: {auction_state.current_item['name']}")
                    socketio.emit('auction_started', auction_state.get_status())

def broadcast_timer():
    while True:
        socketio.sleep(1)
        if auction_state.auction_active:
            status = auction_state.get_status()
            socketio.emit('timer_update', {'time_left': status['time_left']})

if __name__ == "__main__":
    if not auction_state.load_items('auction_items.txt'):
        print("Error: Could not load auction items")
        exit(1)

    print(f"Server started. Loaded {len(auction_state.items)} items.")
    auction_state.start_auction()
    
    socketio.start_background_task(target=auction_timer_thread)
    socketio.start_background_task(target=broadcast_timer)
    socketio.run(app, host=HOST, port=WEB_PORT, debug=True)
