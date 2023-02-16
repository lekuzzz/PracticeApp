from flask import Flask,request,render_template
import json
import csv

app = Flask(__name__)

with open("log.json", 'r', encoding='utf-8') as json_file:   
        jsn = json.load(json_file)

with open("log.json", 'r', encoding='utf-8') as json_file:
        sensorsJson = json.load(json_file)

names = []
sensors = []
dataS = {}

for i in sensorsJson:
    check = True
    for j in range(len(names)):
        if names[j] == (sensorsJson[i]['uName'] + " (" + sensorsJson[i]['serial'] + ")"):
            check = False
    
    if check:
        names.append(str(sensorsJson[i]['uName'] + " (" + sensorsJson[i]['serial'] + ")"))            
        sensors.append([])
        for j in sensorsJson[i]['data']:
            sensors[len(names)-1].append(j)
for j in range(len(names)):
    dataS[names[j]] = sensors[j]
json_data = json.dumps(dataS, ensure_ascii=False)       

@app.route('/', methods=['GET', 'POST'])
def index():
    file = None
    device = None
    sens = None
    id = None
    typeChart = None
    bl = False
    startDate = None
    endDate = None
    if request.method == 'POST':
        try:
            file = request.form['data'].strip()
            device = request.form['device'].strip()
            sens = request.form['sensors'].strip()
            id = request.form['averaging'].strip()
            typeChart = request.form['chart'].strip()
            startDate = request.form['startDate'].strip()
            endDate = request.form['endDate'].strip()
            bl = True   
        except:
            file = None
    return render_template('index.html', viewJSON = bl, names = names, sensors = json_data, data = file, device = device, sens = sens, id = id, typeChart = typeChart, startDate = startDate, endDate = endDate)

@app.route('/data')
def get_data():
    exData = {}
    exportDate = request.args.get('Date').split('$')
    startDate = exportDate[0].split('T')
    startDate = startDate[0] + " " + startDate[1]
    endDate = exportDate[1].split('T')
    endtDate = endDate[0] + " " + endDate[1]
    
    for i in jsn:
        date = jsn[i]['Date']
        date = date.split(':')
        date = date[0] + ":" + date[1]
        
        if startDate <= date and date <= endtDate:
            exData[i] = jsn[i]

    return json.dumps(exData, ensure_ascii=False)

@app.route('/csv')
def get_csv():
    file_name = "last_export.csv"
    with open(file_name, "r", encoding = "cp1251") as f_obj:
        reader = f_obj.read()
        return reader

if __name__ == '__main__':
    app.run(debug=True) 