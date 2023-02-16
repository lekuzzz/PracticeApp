# main.py
from flask import Flask, render_template
import requests
import json
def get_html_page(url):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',}
    try:
        r = requests.get(url, headers=headers)
    except requests.exceptions.RequestException:
        html = None
    else:
        if r.ok:
            html = r.text
    return html
app = Flask(__name__)
@app.route('/')
def index():
    return render_template('index.html')
@app.route('/data')
def get_data():
    URL = "http://webrobo.mgul.ac.ru:3000/db_api_REST/calibr/last5min"
    data = get_html_page(URL)
    data = json.loads(data)
    x_arr = []
    y_arr = []
    x = 0
    for item in data:
        if data[item]['uName'] == "Тест Студии": 
            x_arr.append(x)
            y_arr.append(float(data[item]['data']['BMP280_temp']))
            x+=1
    data['x'] = x_arr
    data['y'] = y_arr
    return json.dumps(data)
    
if __name__ == '__main__':
    app.run() 