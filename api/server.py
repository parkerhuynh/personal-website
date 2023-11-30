
from flask import Flask, request, jsonify, make_response, send_file, Response
import json
import pandas as pd
#from utils import connect_to_mysql
import numpy as np
import base64
import json
import os
import re
from collections import Counter
import ast
from time import sleep
import random
import os
import pickle
import pandas as pd
import pymysql
from sqlalchemy import create_engine
from utils import connect_to_mysql
from word2number import w2n
from utils import make_conn
from datetime import datetime
import calendar
import bcrypt
host = 'localhost'
user = 'root'
password = '12341234'
database = 'personal'


def day_process(datetime_obj):
    """
    Process a date string in the format 'dd/mm/yyyy hh:mm:ss' and return the day of the week, day, and time.

    Parameters:
    date_str (str): A date string in the format 'dd/mm/yyyy hh:mm:ss'.

    Returns:
    tuple: A tuple containing the day of the week, day, and time.
    """
    from datetime import datetime
    import calendar

    # Convert the string to a datetime object

    # Extracting day of the week, day, and time
    day_of_week = calendar.day_name[datetime_obj.weekday()]
    day = datetime_obj.strftime('%d-%m-%Y')
    time = datetime_obj.strftime('%H:%M:%S')

    return day_of_week, day, time


from time import sleep
app = Flask(__name__)
@app.route('/create_user', methods=['POST'])
def create_user():
    data = request.get_json()
    email = data["email"]
    name = data["name"]
    pass_hash = data["password"]
    connection = make_conn()
    with connection.cursor() as cursor:
        cursor.execute(
            f"INSERT INTO users (username, email, password) VALUES "
            f"('{name}', '{email}', '{pass_hash}')"
        )
        connection.commit()
    return Response("success", 201)

@app.route('/get_user_list', methods=['POST','GET'])
def get_user_list():
    connection = make_conn()
    with connection.cursor() as cursor:
        cursor.execute(
            f"SELECT username, email FROM users")
    results = cursor.fetchall()
    result = {"username": [], "email": []}
    for item in results:
        result["username"].append(item["username"])
        result["email"].append(item["email"])
    return result

@app.route('/get_user_info/<email>', methods=['POST','GET'])
def get_user_info(email):
    connection = make_conn()
    with connection.cursor() as cursor:
        cursor.execute(
            f"SELECT * FROM users WHERE email = '{email}';")
    result = cursor.fetchall()[0]
    result["username"] = result["username"]
    return result

@app.route('/get_process_list/<user>', methods=['POST','GET'])
def get_process_list():
    connection = make_conn()
    with connection.cursor() as cursor:
        cursor.execute(
            f"SELECT username, email FROM users")
    results = cursor.fetchall()
    result = {"username": [], "email": []}
    for item in results:
        result["username"].append(item["username"])
        result["email"].append(item["email"])
    return result


@app.route('/add_progress', methods=['POST'])
def add_progress():
    data = request.json
    connection = make_conn()
    with connection.cursor() as cursor:
        query = """INSERT INTO progress (user_id, username, objective, progress, important) 
                    VALUES (%s, %s, %s, %s, %s)"""
        
        cursor.execute(query, (data['user_id'], data['username'], data['objective'], data['progress'], data['important']))
        connection.commit()
        return jsonify({"message": "Progress added successfully"}), 200
    
@app.route('/get_progress/<user_id>', methods=['POST','GET'])
def get_progress(user_id):
    print(user_id)
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT * FROM progress WHERE user_id = {user_id}"
        
        cursor.execute(query)
    results = cursor.fetchall()
    for i in range(len(results)):
        day_of_week, day, time = day_process(results[i]["created_at"])
        
        results[i]["date"] = f"{day_of_week}, {day}"
        results[i]["time"] = time
    return jsonify(results)

@app.route('/delete_progress/<int:row_id>', methods=['POST'])
def delete_progress(row_id):
    # Establish a connection and create a cursor
    connection = make_conn()
    with connection.cursor() as cursor:
        delete_query = F"DELETE FROM progress WHERE id = {row_id}"
        cursor.execute(delete_query)
        connection.commit()
    return Response("success", 200)

if __name__ == "__main__":
    app.run(debug=True, port=8888)