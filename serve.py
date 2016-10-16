# https://gist.github.com/bradmontgomery/2219997

from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import os.path

MEDIA = {
    '.js':  'application/javascript',
    '.ico': 'image/vnd.microsoft.icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.css': 'text/css',
    '.csv': 'text/csv',
    '.html': 'text/html',
}



class S(BaseHTTPRequestHandler):
    def do_GET(self):
        _,ext = os.path.splitext(self.path)
        #print self.path#, ext
        if ext:
            if os.path.exists('public'+self.path):
                self.send_response(200)
                self.send_header('Content-type', MEDIA[ext])
                self.end_headers()
                f = open('public'+self.path, 'rb')
                self.wfile.write(f.read())
                f.close()
            else:
                self.send_response(404)
                self.end_headers()
        else:
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            f = open('public/index.html')
            self.wfile.write(f.read())
            f.close()

def run(server_class=HTTPServer, handler_class=S, port=80):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print 'Starting httpd...'
    httpd.serve_forever()

if __name__ == "__main__":
    run(port=8000)
