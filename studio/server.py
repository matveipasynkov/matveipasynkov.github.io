from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
ROOT=Path(__file__).resolve().parents[1]
os.chdir(ROOT)
class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path not in ['/studio/render-ru','/studio/render-en']:
            self.send_error(404); return
        size=int(self.headers.get('Content-Length','0'))
        if not 0<size<100_000_000:
            self.send_error(413); return
        destination=ROOT/'assets'/('cinema-'+self.path[-2:]+'.webm')
        destination.write_bytes(self.rfile.read(size))
        self.send_response(200);self.end_headers();self.wfile.write(b'Saved')
ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()
