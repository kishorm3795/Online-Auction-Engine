#!/usr/bin/env python3
"""
Demo script that runs server and client together to demonstrate the auction system
"""

import socket
import threading
import time
import sys
import subprocess
import os

# Change to project directory
os.chdir('/Users/pavankishorm/Documents/Online-Auction-Engine')

def start_server():
    """Start the server in background"""
    subprocess.Popen([sys.executable, 'server.py'], 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.STDOUT,
                    text=True,
                    bufsize=1)

# Start server
print("=" * 60)
print("STARTING AUCTION SERVER...")
print("=" * 60)
start_server()
time.sleep(2)

def run_client(name, delay=0):
    """Run a client and return its output"""
    time.sleep(delay)
    
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect(('127.0.0.1', 5555))
    
    output = []
    
    # Receive welcome
    data = sock.recv(1024).decode()
    output.append(f"[{name}] {data.strip()}")
    
    # Send name
    sock.send(f"{name}\n".encode())
    time.sleep(0.5)
    
    # Get status
    sock.send(b"status\n")
    time.sleep(0.5)
    
    # Try to place bid
    sock.send(b"700\n")
    time.sleep(0.5)
    
    # Get final status
    sock.send(b"status\n")
    time.sleep(0.5)
    
    # Quit
    sock.send(b"quit\n")
    time.sleep(0.5)
    
    sock.close()
    return output

print("\n" + "=" * 60)
print("RUNNING CLIENT 1 - Alice...")
print("=" * 60)
client1_output = run_client("Alice", 0)
for line in client1_output:
    print(line)

print("\n" + "=" * 60)
print("RUNNING CLIENT 2 - Bob...")
print("=" * 60)
client2_output = run_client("Bob", 1)
for line in client2_output:
    print(line)

print("\n" + "=" * 60)
print("DEMO COMPLETE!")
print("=" * 60)
print("\nTo test manually:")
print("1. Terminal 1: python3 server.py")
print("2. Terminal 2: python3 client.py")
print("3. Enter your name and start bidding!")

