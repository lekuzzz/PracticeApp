function changeValue(input, sensors)
{
    var datalist = document.getElementById("sensorsList");
    datalist.innerText = null;
    val = input.value;
    var frag = document.createDocumentFragment();

    for(var j of sensors[val])
    {
        let option = document.createElement("option");
        option.value = j;
        frag.appendChild(option);
    }
    datalist.appendChild(frag);
}

function averaging(id, json, dev, ser, s, typeChart, startDate)
{
    startDate = startDate.split('T');
    dayDate = startDate[0].split('-');
    startDate = startDate[1].split(':');

    let x_arr = [];
    let y_arr = [];
    let x = parseInt(startDate[0]);   
    let d = parseInt(dayDate[2]);
    let n = 0;
    let t = 0;
    let bl = true;

    for(i in json)
    {   
        if(json[i].uName == dev && json[i].serial == ser)
        { 
            if( id == "default")
            { 
                x_arr.push(date = json[i].Date);
                y_arr.push(parseFloat(json[i].data[s]));
            }
            if( id == "perHour")
            {   
                if(bl)
                {
                    x_arr.push(date = json[i].Date);
                    y_arr.push(parseFloat(json[i].data[s]));
                    bl = false;
                }
                t = t + parseFloat(json[i].data[s]);
                n++;
                date = json[i].Date;
                date = date.split(" ");
                date = date[1].split(":");
                //|| json[i].Date == endTime
                if (date[0] == (x+1))
                {
                    x_arr.push(json[i].Date);
                    
                    t = t/n;
                    y_arr.push(t);
                    t = 0;
                    n = 0;
                    x++;
                    if ( x == 23) x=0;
                }
        
            }
            if( id == "in3hours")
            {
                if(bl)
                {
                    x_arr.push(date = json[i].Date);
                    y_arr.push(parseFloat(json[i].data[s]));
                    bl = false;
                }
                t = t + parseFloat(json[i].data[s]);
                n++;
                date = json[i].Date;
                date = date.split(" ");
                date = date[1].split(":");
                if (date[0] == (x+3))
                {
                    x_arr.push(json[i].Date);
                    t = t/n;
                    y_arr.push(t);
                    t = 0;
                    n = 0;
                    x = x + 3;
                    if ( x >= 21) x = x - 24;
                }
        
            }
            if( id == "perDay")
            {
                t = t + parseFloat(json[i].data[s]);
                n++;
                date = json[i].Date;
                date = date.split(" ");
                date = date[0].split("-");
                
                if (date[2] == (d+1))
                {
                    x_arr.push(date[0] + "-" + date[1] + "-" + parseInt((date[2] - 1)));                    
                    t = t/n;
                    y_arr.push(t);
                    t = 0;
                    n = 0;
                    d++;
                    if ( d == 30) d=0;
                }
        
            }
        }
    }
    var trace1 = 
    {
        x: x_arr,
        y: y_arr,
        type: typeChart
    };
    return trace1;
}

function show(d, dev, s, id, typeChart, startDate, endDate) 
{
    var exportDate = startDate + "$" + endDate;
    var xhr = new XMLHttpRequest();
    if(d == "JSON") xhr.open('GET', '/data?Date=' + exportDate, true);
    if(d == "CSV") xhr.open('GET', '/csv', true);
    xhr.onload = function() 
    {
        if (xhr.status == 200 ) 
        {

            if(d == "JSON")
            {   
                json = JSON.parse(xhr.response);
                dev = dev.split(" (");
                sens = dev[1].split(")");
                tr = averaging(id, json, dev[0], sens[0], s, typeChart, startDate);
                var data = [tr];
            }
        
            if(d == "CSV")
            {
                let x_arr = [];
                let y_arr = [];
                let date = "";

                csv = xhr.response;
                line = csv.split('\n'); 
                line.pop()
                var csv = [];

                for (i in line)
                {
                    csv[i] = line[i].split(';');
                }
    
                for (i in line)
                {   
                    if (csv[i][0] != "Прибор: " && csv[i][0] != "Date") 
                    {
                        x_arr.push(csv[i][0]);
                        y_arr.push(csv[i][1]);
                    } 
                }
                var trace1 = 
                {
                    x: x_arr,
                    y: y_arr,
                    type: typeChart
                };
                var data = [trace1];
            }    

            Plotly.newPlot('myDiv', data);
        }
    };
    xhr.send();  
}