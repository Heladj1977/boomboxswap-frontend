import time
import webbrowser
import requests

URL = "http://127.0.0.1:8000/interface"
while True:
    try:
        r = requests.get(URL, timeout=1)
        if r.status_code == 200:
            break
    except Exception:
        pass
    time.sleep(1)
webbrowser.open(URL) 