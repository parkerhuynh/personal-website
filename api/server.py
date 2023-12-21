
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
from datetime import datetime, timedelta
import calendar
from time import sleep
import bcrypt
import pytz
from datetime import datetime
import calendar
host = 'localhost'
user = 'root'
password = '12341234'
database = 'personal'
import string

def day_process(datetime_str):
    original_datetime = pd.to_datetime(datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S')).tz_localize('Australia/Melbourne')
    
    sydney_timezone = pytz.timezone('Australia/Melbourne')
    sydney_datetime = original_datetime.replace(tzinfo=sydney_timezone)
    return sydney_datetime



def format_deadline(deadline, current_time_in_timezone):
    diff = deadline - current_time_in_timezone

    # Constants
    one_day = timedelta(days=1)
    one_week = timedelta(days=7)
    one_month = timedelta(days=30)

    # If the deadline has passed
    if diff.total_seconds() < 0:
            # Calculate the time since deadline
            since_deadline = abs(diff)
            if since_deadline < one_day:
                hours = since_deadline.seconds // 3600
                return f"Expired {hours} hour{'s' if hours > 1 else ''} ago"
            elif since_deadline < one_month:
                days = since_deadline.days
                return f"Expired {days} day{'s' if days > 1 else ''} ago"
            else:
                months = since_deadline.days // 30
                days = since_deadline.days % 30
                return f"Expired {months} month{'s' if months > 1 else ''} and {days} day{'s' if days > 1 else ''} ago"

    # If the deadline is in the future
    else:
        if diff > one_month:
            return f"In {diff.days // 30} month{'s' if diff.days // 30 > 1 else ''} and {diff.days % 30} day{'s' if diff.days % 30 > 1 else ''}"
        elif diff > one_week:
            return f"In {diff.days // 7} week{'s' if diff.days // 7 > 1 else ''} and {diff.days % 7} day{'s' if diff.days % 7 > 1 else ''}"
        elif diff > one_day:
            return f"In {diff.days} day{'s' if diff.days > 1 else ''} and {diff.seconds // 3600} hour{'s' if diff.seconds // 3600 > 1 else ''}"
        else:
            hours = diff.seconds // 3600
            minutes = (diff.seconds % 3600) // 60
            return f"In {hours} hour{'s' if hours > 1 else ''} and {minutes} minute{'s' if minutes > 1 else ''}"
        
def extract_and_sort(data):
    datasets = {}
    results = {}
    #print(data)

    for key, value in data.items():
        if key.startswith('dataset_'):
            num = int(key.split('_')[1])  # Extract the number
            datasets[num] = value
        elif key.startswith('result_'):
            num = int(key.split('_')[1])  # Extract the number
            results[num] = value

    # Convert the dictionaries to ordered lists
    datasets_list = [datasets[i] for i in sorted(datasets)]
    results_list = [results[i] for i in sorted(results)]

    return datasets_list, results_list

def generate_random_id(length=15):
    """ Generate a random string of fixed length """
    letters = string.ascii_letters + string.digits
    return ''.join(random.choice(letters) for i in range(length))

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

#PROGRESS PROCESS -------------------------------------------------------------------------------------------------------
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
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT * FROM progress WHERE user_id = {user_id}"
        cursor.execute(query)
    results = cursor.fetchall()
    if len(results) == 0:
        return jsonify([])
    results = pd.DataFrame(results)
    results['created_at'] = results['created_at'].dt.strftime('%Y-%m-%d %H:%M:%S')
    # results['created_at'] = results['created_at'].map(day_process)
    # ##print("-----------------------")
    # #print(results['created_at'] )
    

    # if day != "all":
    #     results['created_at_temp'] = results['created_at'].dt.date
    #     sydney_timezone = pytz.timezone('Australia/Sydney')
    #     current_datetime_sydney = datetime.now(sydney_timezone).date()

    #     threshold_datetime = current_datetime_sydney - timedelta(days=int(day))
    #     results = results[results['created_at_temp'] > threshold_datetime]

    # results['created_at'] =results['created_at'].apply(lambda x: x.strftime("%d-%m-%Y %H:%M:%S %z"))
    results = results.to_dict("records")
    return jsonify(results)

@app.route('/delete_progress/<int:row_id>', methods=['DELETE'])
def delete_progress(row_id):
    connection = make_conn()
    with connection.cursor() as cursor:
        delete_query = F"DELETE FROM progress WHERE id = {row_id}"
        cursor.execute(delete_query)
        connection.commit()
    return Response("success", 200)

@app.route('/update_progress/<int:progress_id>', methods=['POST'])
def update_progress(progress_id):
    data = request.get_json()
    objective = data['objective']
    progress = data['progress']
    connection = make_conn()
    progress_id = str(progress_id)
    with connection.cursor() as cursor:
        query = """UPDATE progress
           SET objective = %s, progress = %s
           WHERE id = %s"""
        cursor.execute(query, (objective, progress, progress_id))
        connection.commit()
    return jsonify({"message": "Progress updated successfully"}), 200

#DEALINE PROCESS -------------------------------------------------------------------------------------------------------
@app.route('/add-deadline', methods=['POST'])
def add_deadline():
    data = request.json
    connection = make_conn()
    with connection.cursor() as cursor:
        sql = "INSERT INTO deadlines (end_date, notification, objective, note, user_id, username, status, timezone, offset) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
        values = (data['end_date'], data['notification'], data['objective'], data['note'], data['user_id'], data['username'], "no status", data['timezone'], data['offset'])
        cursor.execute(sql, values)
        connection.commit()

    return jsonify({'message': 'Deadline added successfully'}), 200


@app.route('/get_deadlines/<user_id>', methods=['POST','GET'])
def get_deadlines(user_id):
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT * FROM deadlines WHERE user_id = {user_id}"
        cursor.execute(query)
    results = cursor.fetchall()
    return jsonify(results)


@app.route('/delete_deadline/<int:row_id>', methods=['POST'])
def delete_deadline(row_id):
    # Establish a connection and create a cursor
    connection = make_conn()
    with connection.cursor() as cursor:
        delete_query = f"DELETE FROM deadlines WHERE id = {row_id}"
        cursor.execute(delete_query)
        connection.commit()
    return Response("success", 200)

@app.route('/update_deadline/<int:item_id>', methods=['POST'])
def update_deadline(item_id):
    data = request.json
    connection = make_conn()
    with connection.cursor() as cursor:
            sql = (
                f"UPDATE deadlines SET "
                f"end_date='{data['end_date']}', "
                f"notification={data['notification']}, "
                f"objective='{data['objective']}', "
                f"note='{data['note']}', "
                f"status='{data['status']}', "
                f"timezone='{data['timezone']}' "
                f"WHERE id={item_id}"
            )
            cursor.execute(sql)
            connection.commit()
    return jsonify({'message': 'Deadline updated successfully'}), 200


#PROCESS PAER
@app.route('/add_paper', methods=['POST'])
def add_paper():
    try:
        paper_data = request.json
        paperid = generate_random_id()
        datasets, results = extract_and_sort(paper_data)
        datasets_str = ', '.join(datasets)
        results_str = ', '.join(results)
        
        insert_query = """
        INSERT INTO papers (user_id, paper, author, conference, year, name, img_encoder, ques_encoder, 
        fusion, datasets, results, paperid, problems, contribute, structure, abstract, url, category)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        
        data = (
            paper_data['user_id'], paper_data['paper'], paper_data['author'], paper_data['conference'],
            paper_data['year'], paper_data['name'], paper_data['img_encoder'], paper_data['ques_encoder'],
            paper_data['fusion'], datasets_str, results_str, paperid,
            paper_data['problems'], paper_data['contributions'], paper_data['structure'],
            paper_data['abstract'], paper_data['url'], paper_data['category']
        )
        connection = make_conn()
        with connection.cursor() as cursor:
            cursor.execute(insert_query, data)
            connection.commit()
        return jsonify({'message': 'paper added successfully'}), 200
    except:
        return jsonify({'message': 'wrong'}), 201

@app.route('/delete_paper/<int:row_id>', methods=['DELETE'])
def delete_paper(row_id):
    # Establish a connection and create a cursor
    connection = make_conn()
    with connection.cursor() as cursor:
        delete_query = f"DELETE FROM papers WHERE id = {row_id}"
        cursor.execute(delete_query)
        connection.commit()
    return Response("success", 200)

@app.route('/get_papers/<user_id>', methods=['POST','GET'])
def get_papers(user_id):
    try:
        connection = make_conn()
        with connection.cursor() as cursor:
            query = f"SELECT id, paper, author, name, conference,year, img_encoder, ques_encoder, fusion, category, datasets, results, paperid FROM papers WHERE user_id = {user_id}"
            cursor.execute(query)
        results = cursor.fetchall()
        print(results)
        results = pd.DataFrame(results)
        results["datasets"] = results["datasets"].apply(lambda x:x.split(', ') )
        results["results"] = results["results"].apply(lambda x:x.split(', ') )
        return jsonify(results.to_dict("records"))
    except:
        return Response("error", 403)

@app.route('/get_one_paper/<use_id>/<paperid>', methods=['POST','GET'])
def get_one_paper(use_id, paperid):
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT * FROM papers WHERE paperid = '{paperid}' and user_id = {use_id}"
        cursor.execute(query)
    results = cursor.fetchall()
    results = pd.DataFrame(results)
    results["datasets"] = results["datasets"].apply(lambda x:x.split(', ') )
    results["results"] = results["results"].apply(lambda x:x.split(', ') )

    if len(results) > 0:
        return results.to_dict("records")[0]
    else:
        return Response("error", 403)

@app.route('/update_paper', methods=['POST','GET'])
def update_paper():
    paper_data = request.json
    #print(paper_data)
    paperid = paper_data['paperid']

    # Prepare SQL update query
    update_query = """
    UPDATE papers
    SET paper = %s, author = %s, conference = %s, year = %s, name = %s, 
    img_encoder = %s, ques_encoder = %s, fusion = %s, datasets = %s, results = %s, 
    problems = %s, contribute = %s, structure = %s, abstract = %s, url = %s, category = %s WHERE paperid = %s
    """
    print(update_query)
    # Extract other fields from paper_data and convert lists to strings
    datasets, results = extract_and_sort(paper_data)
    
    datasets_str = ', '.join(datasets)
    results_str = ', '.join(results)
    #print(results_str)
    # Prepare data for the query
    data = (
        paper_data['paper'], paper_data['author'], paper_data['conference'],
        paper_data['year'], paper_data['name'], paper_data['img_encoder'], paper_data['ques_encoder'],
        paper_data['fusion'], datasets_str, results_str,
        paper_data['problems'], paper_data['contribute'], paper_data['structure'],
        paper_data['abstract'], paper_data['url'], paper_data['category'],
        paperid  # This is the WHERE clause value
    )

    connection = make_conn()
    with connection.cursor() as cursor:
        cursor.execute(update_query, data)
        connection.commit()
    return jsonify({'message': 'paper added successfully'}), 200

#LIST TO DO ------------------------------------
@app.route('/get_list_todo/<user_id>', methods=['GET'])
def get_list_todo(user_id):
    connection = make_conn()
    with connection.cursor() as cursor:
        cursor.execute(f"SELECT * FROM list_to_do where user_id={user_id}")
    tasks = cursor.fetchall()
    if len(tasks) == 0:
        return []
    return jsonify(tasks)

@app.route('/add_task', methods=['POST'])
def add_task():
    data = request.json
    
    connection = make_conn()
    with connection.cursor() as cursor:
        cursor.execute("INSERT INTO list_to_do (date, complete, task, user_id, task_id) VALUES (%s, %s, %s, %s, %s)", (str(data['date']), 0, data['task'], data["user_id"], data["task_id"]))
        connection.commit()
    return jsonify({'message': 'Task added'})

@app.route('/update_task', methods=['POST'])
def update_task():
    data = request.json
    connection = make_conn()
    with connection.cursor() as cursor:
        cursor.execute("UPDATE list_to_do SET date= %s, complete = %s, task = %s WHERE task_id = %s", (data['date'], data['complete'], data['task'],data['task_id']))
        connection.commit()
    return jsonify({'message': 'Task updated'})

@app.route('/delete_tasks/<task_id>', methods=['POST'])
def delete_task(task_id):

    
    connection = make_conn()
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM list_to_do WHERE task_id = %s", (task_id))
        connection.commit()
    return jsonify({'message': 'Task deleted'})

#ENGLISH PROCESS -------------------------------------------------------------------------------------------------------
@app.route('/add_speaking_para', methods=['POST'])
def add_speaking_para():
    try:
        speaking_para_data = request.json
        
        insert_query = """
        INSERT INTO speaking_para (user_id, topic, context, created_at)
        VALUES (%s, %s, %s, %s)
        """

        
        data = (
            speaking_para_data['user_id'], speaking_para_data['topic'], speaking_para_data['context'], speaking_para_data['created_at']
        )
        connection = make_conn()
        with connection.cursor() as cursor:
            cursor.execute(insert_query, data)
            connection.commit()
        return jsonify({'message': 'paper added successfully'}), 200
    except:
        return jsonify({'message': 'wrong'}), 201
if __name__ == "__main__":
    app.run(debug=True, port=8888)