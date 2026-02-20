#!/usr/bin/env python3
"""
Online Auction Engine - Client
TCP-based real-time bidding client
"""

import socket
import threading
import sys

# Server configuration
DEFAULT_HOST = '127.0.0.1'
DEFAULT_PORT = 5555
BUFFER_SIZE = 1024

class AuctionClient:
    def __init__(self, host=DEFAULT_HOST, port=DEFAULT_PORT):
        self.host = host
        self.port = port
        self.client_socket = None
        self.connected = False
        self.receive_thread = None

    def connect(self):
        """Connect to auction server"""
        try:
            self.client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.client_socket.connect((self.host, self.port))
            self.connected = True
            print("Connected to auction server!")
            return True
        except ConnectionRefusedError:
            print("Error: Could not connect to server. Make sure server is running.")
            return False
        except Exception as e:
            print(f"Connection error: {e}")
            return False

    def receive_messages(self):
        """Receive messages from server in separate thread"""
        while self.connected:
            try:
                data = self.client_socket.recv(BUFFER_SIZE)
                if not data:
                    print("\nDisconnected from server")
                    self.connected = False
                    break
                
                message = data.decode()
                print(message, end='')
                
                # Check if server sent goodbye
                if "Goodbye" in message:
                    self.connected = False
                    break
                    
            except ConnectionResetError:
                print("\nConnection lost")
                self.connected = False
                break
            except Exception as e:
                if self.connected:
                    print(f"\nError: {e}")
                self.connected = False
                break

    def send_message(self, message):
        """Send message to server"""
        try:
            self.client_socket.send(message.encode())
            return True
        except Exception as e:
            print(f"Send error: {e}")
            return False

    def start_receive_thread(self):
        """Start thread to receive messages"""
        self.receive_thread = threading.Thread(target=self.receive_messages, daemon=True)
        self.receive_thread.start()

    def close(self):
        """Close connection"""
        self.connected = False
        if self.client_socket:
            try:
                self.client_socket.close()
            except:
                pass

def main():
    """Main client function"""
    # Get server address
    host = input("Enter server IP (default: 127.0.0.1): ").strip() or DEFAULT_HOST
    port_str = input("Enter server port (default: 5555): ").strip() or str(DEFAULT_PORT)
    
    try:
        port = int(port_str)
    except ValueError:
        print("Invalid port number")
        return

    # Create and connect client
    client = AuctionClient(host, port)
    
    if not client.connect():
        return

    # Start receiving messages in background
    client.start_receive_thread()

    # Small delay to allow welcome message to be received
    import time
    time.sleep(0.5)

    # Main input loop
    try:
        while client.connected:
            try:
                user_input = input()
                if not client.connected:
                    break
                    
                if user_input.lower() == 'quit':
                    client.send_message(user_input)
                    break
                elif user_input.lower() == 'status':
                    client.send_message(user_input)
                elif user_input.lower() in ['next', 'skip']:
                    client.send_message(user_input)
                else:
                    # Try to send as bid
                    client.send_message(user_input)
                    
            except EOFError:
                break
            except KeyboardInterrupt:
                print("\nDisconnecting...")
                client.send_message("quit")
                break

    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        client.close()
        print("Disconnected from auction")

if __name__ == "__main__":
    main()

