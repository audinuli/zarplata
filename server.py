
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import threading
import time

class WebAppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="webapp", **kwargs)

def start_server():
    server = HTTPServer(('0.0.0.0', 5000), WebAppHandler)
    print("Web App server started on http://0.0.0.0:5000")
    server.serve_forever()

if __name__ == "__main__":
    start_server()
