#!/usr/bin/env python3
"""
Test client for demonstrating the auction system
"""

import socket
import time
import threading

HOST = '127.0.0.1'
PORT = 5555

def receive_and_print(sock):
    """Receive and print messages from server"""
    while True:
        try:
            data = sock.recv(1024)
            if not data:
                break
            print(data.decode(), end='')
        except:
            break

# Create client socket
print("Connecting to auction server...")
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect((HOST, PORT))

# Start receive thread
recv_thread = threading.Thread(target=receive_and_print, args=(client,), daemon=True)
recv_thread.start()

time.sleep(1)

# Send name
print("--- Sending name: John ---")
client.send(b"John\n")
time.sleep(1)

# Place a bid
print("--- Placing bid: 600 ---")
client.send(b"600\n")
time.sleep(1)

# Check status
print("--- Requesting status ---")
client.send(b"status\n")
time.sleep(1)

# Quit
print("--- Quitting ---")
client.send(b"quit\n")
time.sleep(1)

client.close()
print("\n=== Test completed ===")

