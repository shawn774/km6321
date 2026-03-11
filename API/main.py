import json
from flask import Flask, request, jsonify, render_template, url_for, redirect
from flask_cors import CORS  # https://corydolphin.com/flask-cors/extension/

from utils import SingPioneers as SP


# Create Flask object
app = Flask(__name__)
CORS(app)  # this will allow all domains
# CORS(app, origins=[ 'https://singpioneers.sg' ])



### API routes

### /SP: SingPioneers
@app.route('/SP', methods=['GET', 'POST'])

def SP_help():
    if request.method == 'GET':
        return { 
            "help": "To retrieve graph (in JSON format) from SingPioneers knowledge graph, append to URL: /SPget/<queryID>/<parameter1>/<parameter2> | Example: http://km6321.as.r.appspot.com/SPget/0/Zubir_Said/_"
        }
    else:  # POST method
        return { 
            "help": "You're attempting to access using POST method. You can also access using GET method by appending to URL: /SPget/<queryID>/<parameter1>/<parameter2> | Example: http://km6321.as.r.appspot.com/SPget/0/Zubir_Said/_"
        }


@app.get('/SPget/<queryID>/<param1>/<param2>')

def SP_query(queryID, param1, param2):
   match queryID:
    case 'interethnic_table' | 'triad_table' | 'top_influential' | 'top_influential_group':
        if queryID == 'top_influential_group':
            return SP.retrieve_table(queryID, param1, param2.split(","))
        else:
            return SP.retrieve_table(queryID, param1, param2)

    case '2a' | 'relationList' | 'rel_typeList' | 'node_labelList' | 'node_typeList' | 'group_network':
        return SP.retrieve(queryID, param1, param2.split(","))

    case _:
        return SP.retrieve(queryID, param1, param2)

@app.get('/website')

def website():
    # return render_template('index.html')
    return redirect( url_for('static', filename='index.html') )
    
