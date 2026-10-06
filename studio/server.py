from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os,re
ROOT=Path(__file__).resolve().parents[1]
FRAMES=ROOT.parent/'cinema-v5'/'frames'
os.chdir(ROOT)
class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        match=re.fullmatch(r'/studio/frame-(ru|en)/(\d{5})',self.path)
        if not match: self.send_error(404); return
        size=int(self.headers.get('Content-Length','0'))
        if not 0<size<8_000_000: self.send_error(413); return
        folder=FRAMES/match[1];folder.mkdir(parents=True,exist_ok=True)
        (folder/(match[2]+'.png')).write_bytes(self.rfile.read(size))
        self.send_response(200);self.end_headers();self.wfile.write(b'OK')
    def log_message(self,*args): pass
ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()
