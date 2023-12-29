
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
    
@app.route('/get_progress/<user_id>/<days>', methods=['POST','GET'])
def get_progress(user_id, days):
    if days != "all":
        days = int(days)
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT * FROM progress WHERE user_id = {user_id}"
        cursor.execute(query)
    results = cursor.fetchall()
    if len(results) == 0:
        return jsonify([])
    results = pd.DataFrame(results)

    if days != "all":
        current_date = pd.Timestamp.now().normalize()
        three_days_ago = current_date - pd.Timedelta(days=days)
        results['created_normalized'] = results['created_at'].dt.normalize()
        results = results[results['created_normalized'] >= three_days_ago]
    results['created_at'] = results['created_at'].dt.strftime('%Y-%m-%d %H:%M:%S')
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

#SPEAKING ENGLISH PROCESS -------------------------------------------------------------------------------------------------------
@app.route('/get_speaking_para/<user_id>/<option>', methods=['GET'])
def get_speaking_para(user_id, option):
    connection = make_conn()
    user_id = int(user_id)
    with connection.cursor() as cursor:
        if option == "you":
            query = f"SELECT * FROM speaking_para WHERE user_id = {user_id}"
        else:
            query = f"SELECT * FROM speaking_para"
        cursor.execute(query)
    results = cursor.fetchall()
    if len(results) == 0:
        return []
    results = pd.DataFrame(results)
    results['created_at'] = results['created_at'].dt.strftime('%Y-%m-%d %H:%M:%S')
    with connection.cursor() as cursor:
        query = f"SELECT * FROM speaking_done"
        cursor.execute(query)
    done_results = cursor.fetchall()
    done_results = pd.DataFrame(done_results)
    if len(done_results) == 0:
        done_results = pd.DataFrame(columns=[
            'para_id',
            'total_rows_all_users',
            'min_duration_all_users',
            'skip_value_min_duration_all_users',
            'total_rows_given_user',
            'min_duration_given_user',
            'skip_value_min_duration_given_user'
        ])
    else:
        all_users_results = done_results.groupby('para_id').agg(
            total_rows_all_users=pd.NamedAgg(column='id', aggfunc='count'),
            min_duration_all_users=pd.NamedAgg(column='duration', aggfunc='min'),
            skip_value_min_duration_all_users=pd.NamedAgg(column='duration', aggfunc=lambda x: done_results.loc[x.idxmin(), 'skip'])
        ).reset_index()

        # Calculate the total row, minimum duration and its skip value for the given user_id
        given_user_results = done_results[done_results['user_id'] == user_id].groupby('para_id').agg(
            total_rows_given_user=pd.NamedAgg(column='id', aggfunc='count'),
            min_duration_given_user=pd.NamedAgg(column='duration', aggfunc='min'),
            skip_value_min_duration_given_user=pd.NamedAgg(column='duration', aggfunc=lambda x: done_results.loc[x.idxmin(), 'skip'])
        ).reset_index()

        # Merge the results for all users and the given user_id on para_id
        final_results = pd.merge(all_users_results, given_user_results, on='para_id', how='left')

        # If there are NaN values for the given user_id, replace them with 0
        # final_results.fillna("None", inplace=True)
        final_results['min_duration_all_users'] = round(final_results['min_duration_all_users'] / 1000, 2)
        final_results['min_duration_given_user'] = round(final_results['min_duration_given_user'] / 1000, 2)
    results = results.merge(final_results, on="para_id", how='left')
    results.fillna("NaN", inplace=True)
    results = results.to_dict("records")
    return results

@app.route('/add_speaking_para', methods=['POST'])
def add_speaking_para():

    try:
        speaking_para_data = request.json
        insert_query = """
        INSERT INTO speaking_para (user_id, topic, content, para_id, title, level)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        data = (
            speaking_para_data['user_id'], speaking_para_data['topic'], speaking_para_data['content'], 
            speaking_para_data['para_id'], speaking_para_data['title'], speaking_para_data['level']
        )
        
        connection = make_conn()
        with connection.cursor() as cursor:
            cursor.execute(insert_query, data)
            connection.commit()
        return jsonify({'message': 'paper added successfully'}), 200
    except:
        return jsonify({'message': 'wrong'}), 201

@app.route('/update_speaking_para', methods=['POST'])
def update_speaking_para():
    data = request.get_json()
    connection = make_conn()
    with connection.cursor() as cursor:
        query = """UPDATE speaking_para
           SET title = %s, topic = %s, content = %s, level = %s 
           WHERE para_id = %s"""
        cursor.execute(query, (data["title"], data["topic"], data["content"], data["level"], data["para_id"]))
        connection.commit()
    return jsonify({"message": "Progress updated successfully"}), 200

@app.route('/delete_speaking_pata/<para_id>', methods=['POST'])
def delete_speaking_pata(para_id):
    connection = make_conn()
    with connection.cursor() as cursor:
        delete_query = F"DELETE FROM speaking_para WHERE para_id = '{para_id}'"
        print(delete_query)
        cursor.execute(delete_query)
        connection.commit()
    return Response("success", 200)

@app.route('/get_one_para/<para_id>', methods=['POST','GET'])
def get_one_para(para_id):
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT * FROM speaking_para WHERE para_id = '{para_id}'"
        cursor.execute(query)
    results = cursor.fetchall()
    if len(results) > 0:
        return jsonify(results)
    else:
        return Response("error", 403)

@app.route('/get_all_para_id', methods=['POST','GET'])
def get_all_para_id():
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT para_id,user_id FROM speaking_para"
        cursor.execute(query)
    results = cursor.fetchall()
    if len(results) > 0:
        return jsonify(results)
    else:
        return Response("error", 403)
    
@app.route('/add_speaking_event', methods=['POST'])
def add_speaking_event():
    try:
        speaking_para_data = request.json
        insert_query = """
        INSERT INTO speaking_events (user_id, para_id, duration, level, word, index_para)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        data = (
            speaking_para_data['user_id'], speaking_para_data['para_id'], 
            speaking_para_data['duration'], speaking_para_data['level'], speaking_para_data['word'], speaking_para_data['index_para']
        )
        
        connection = make_conn()
        with connection.cursor() as cursor:
            cursor.execute(insert_query, data)
            connection.commit()
        return jsonify({'message': 'paper added successfully'}), 200
    except:
        return jsonify({'message': 'wrong'}), 201

@app.route('/add_speaking_word', methods=['POST'])
def add_speaking_word():
    try:
        speaking_para_data = request.json
        insert_query = """
        INSERT INTO speaking_words (user_id, para_id, checking_word, speaking_word, index_para)
        VALUES (%s, %s, %s, %s, %s)
        """
        data = (
            speaking_para_data['user_id'], speaking_para_data['para_id'], 
            speaking_para_data['checking_word'], speaking_para_data['speaking_word'], speaking_para_data['index_para']
        )
        
        connection = make_conn()
        with connection.cursor() as cursor:
            cursor.execute(insert_query, data)
            connection.commit()
        return jsonify({'message': 'paper added successfully'}), 200
    except:
        return jsonify({'message': 'wrong'}), 201

@app.route('/save_completed_speaking', methods=['POST'])
def save_completed_speaking():
    try:
        speaking_para_data = request.json
        insert_query = """
        INSERT INTO speaking_done (user_id, para_id, duration, transcript, skip)
        VALUES (%s, %s, %s, %s, %s)
        """
        data = (
            speaking_para_data['user_id'], speaking_para_data['para_id'], 
            speaking_para_data['duration'], speaking_para_data['transcript'], speaking_para_data['skip']
        )
        
        connection = make_conn()
        with connection.cursor() as cursor:
            cursor.execute(insert_query, data)
            connection.commit()
        return jsonify({'message': 'paper added successfully'}), 200
    except:
        return jsonify({'message': 'wrong'}), 201


@app.route('/diff_word_dur_misspell/<user_id>/<day>/<country>/<city>', methods=['POST','GET'])
def diff_word_dur_misspell(day, user_id, country, city):
    timezone = f"{country}/{city}"
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT * FROM speaking_events WHERE user_id={user_id}"
        cursor.execute(query)
    event_results = cursor.fetchall()
    event_results = pd.DataFrame(event_results)

    with connection.cursor() as cursor:
        query = f"SELECT * FROM speaking_words WHERE user_id={user_id}"
        cursor.execute(query)
    word_results = cursor.fetchall()
    word_results = pd.DataFrame(word_results)
    
    if len(event_results) == 0 or len(word_results) == 0:
        return []
    if day != "all":
        day = int(day)
        if timezone != 'Australia/Sydney':
            current_date = pd.Timestamp.now(tz=timezone).normalize()
        else:
            current_date = pd.Timestamp.now().normalize()
        days_ago = current_date - pd.Timedelta(days=day)
        if timezone != 'Australia/Sydney':
            event_results["created_at"] = event_results["created_at"].dt.tz_localize('Australia/Sydney')
            event_results["created_at"] = event_results["created_at"].dt.tz_convert(timezone)

            word_results["created_at"] = word_results["created_at"].dt.tz_localize('Australia/Sydney')
            word_results["created_at"] = word_results["created_at"].dt.tz_convert(timezone)

        event_results['created_normalized'] = event_results['created_at'].dt.normalize()
        event_results = event_results[event_results['created_normalized'] > days_ago]
        word_results['created_normalized'] = word_results['created_at'].dt.normalize()
        word_results = word_results[word_results['created_normalized'] > days_ago]

    if len(event_results) == 0 or len(word_results) == 0:
        return []
    
    event_average_duration = event_results.groupby('word')['duration'].mean().reset_index()
    event_average_duration = event_average_duration.sort_values(by='duration', ascending=False)
    unique_word_results = word_results.groupby('checking_word')['speaking_word'].unique().reset_index()
    word_analysis = pd.merge(event_average_duration, unique_word_results, left_on="word", right_on="checking_word")
    word_analysis = word_analysis[:50]
    word_analysis["duration"] = word_analysis["duration"].apply(lambda x: round(x/1000, 2))
    word_analysis["speaking_word"] = word_analysis["speaking_word"].apply(lambda x: x.tolist())
    return word_analysis.to_dict("records")

@app.route('/skip_count_words_func/<user_id>/<day>/<country>/<city>', methods=['POST','GET'])
def skip_count_words_func(user_id, day, country, city):
    timezone = f"{country}/{city}"
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT * FROM speaking_events WHERE user_id={user_id}"
        cursor.execute(query)
    event_results = cursor.fetchall()
    event_results = pd.DataFrame(event_results)
    if len(event_results) ==0:
        return []
    
    if day != "all":
        day = int(day)
        if timezone != 'Australia/Sydney':
            current_date = pd.Timestamp.now(tz=timezone).normalize()
        else:
            current_date = pd.Timestamp.now().normalize()
        days_ago = current_date - pd.Timedelta(days=day)
        if timezone != 'Australia/Sydney':
            event_results["created_at"] = event_results["created_at"].dt.tz_localize('Australia/Sydney')
            event_results["created_at"] = event_results["created_at"].dt.tz_convert(timezone)

        event_results['created_normalized'] = event_results['created_at'].dt.normalize()
        event_results = event_results[event_results['created_normalized'] > days_ago]
        
    if len(event_results) ==0:
        return []
    skip_count_words = event_results[event_results["level"] == 100]["word"].value_counts().reset_index()[:50]
    return skip_count_words.to_dict("records")

@app.route('/total_speaking_per_day/<user_id>/<day>/<country>/<city>', methods=['POST','GET'])
def total_speaking_per_day(user_id, day, country, city):
    timezone = f"{country}/{city}"
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT * FROM speaking_words WHERE user_id={user_id}"
        cursor.execute(query)
    word_results = cursor.fetchall()
    word_results = pd.DataFrame(word_results)
    if len(word_results) == 0:
        return []

    if day != "all":
        day = int(day)
        if timezone != 'Australia/Sydney':
            current_date = pd.Timestamp.now(tz=timezone).normalize()
        else:
            current_date = pd.Timestamp.now().normalize()

        days_ago = current_date - pd.Timedelta(days=day)

        if timezone != 'Australia/Sydney':
            word_results["created_at"] = word_results["created_at"].dt.tz_localize('Australia/Sydney')
            word_results["created_at"] = word_results["created_at"].dt.tz_convert(timezone)
        word_results['created_normalized'] = word_results['created_at'].dt.normalize()
        word_results = word_results[word_results['created_normalized'] > days_ago]

    if len(word_results) == 0:
        return []

    word_results['created_at'] = pd.to_datetime(word_results['created_at'])
    grouped = word_results.groupby(word_results['created_at'].dt.date)
    total_true_speaking_result = grouped['speaking_word'].agg(
        total_speaking='count', 
        true_spelling=lambda x: (word_results.loc[x.index, 'checking_word'] == x).sum())
    total_true_speaking_result = total_true_speaking_result.reset_index()
    total_true_speaking_result["created_at"] = pd.to_datetime(total_true_speaking_result["created_at"]).dt.strftime('%Y-%m-%d')
    total_true_speaking_result["successRate"] = total_true_speaking_result["true_spelling"]/total_true_speaking_result["total_speaking"]
    total_true_speaking_result["successRate"] = total_true_speaking_result["successRate"].apply(lambda x: round(x, 2))
    total_true_speaking_result = total_true_speaking_result.rename(columns= {"created_at": "date"})
    return total_true_speaking_result.to_dict("records")

@app.route('/done_counts_func/<user_id>/<day>/<country>/<city>', methods=['POST','GET'])
def done_counts_func(user_id, day, country, city):
    timezone = f"{country}/{city}"
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT * FROM speaking_done WHERE user_id={user_id}"
        cursor.execute(query)
    done_results = cursor.fetchall()
    done_results = pd.DataFrame(done_results)
    
    if len(done_results) == 0:
        return []

    if day != "all":
        day = int(day)
        if timezone != 'Australia/Sydney':
            current_date = pd.Timestamp.now(tz=timezone).normalize()
        else:
            current_date = pd.Timestamp.now().normalize()

        days_ago = current_date - pd.Timedelta(days=day)

        if timezone != 'Australia/Sydney':
            done_results["created_at"] = done_results["created_at"].dt.tz_localize('Australia/Sydney')
            done_results["created_at"] = done_results["created_at"].dt.tz_convert(timezone)    
        done_results['created_normalized'] = done_results['created_at'].dt.normalize()
        done_results = done_results[done_results['created_normalized'] > days_ago]
    if len(done_results) == 0:
        return []
    done_results['created_normalized'] = done_results['created_at'].dt.normalize()
    done_counts = done_results["created_normalized"].value_counts().reset_index()
    done_counts["created_normalized"] = pd.to_datetime(done_counts["created_normalized"]).dt.strftime('%Y-%m-%d')
    done_counts = done_counts.rename(columns={"created_normalized": "date"})
    return done_counts.to_dict("records")

@app.route('/skip_count_per_day_func/<user_id>/<day>/<country>/<city>', methods=['POST','GET'])
def skip_count_per_day_func(user_id, day, country, city):
    timezone = f"{country}/{city}"
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT * FROM speaking_events WHERE user_id={user_id}"
        cursor.execute(query)
    event_results = cursor.fetchall()
    event_results = pd.DataFrame(event_results)

    if len(event_results) ==0:
        return []
    if day != "all":
        day = int(day)
        if timezone != 'Australia/Sydney':
            current_date = pd.Timestamp.now(tz=timezone).normalize()
        else:
            current_date = pd.Timestamp.now().normalize()
        days_ago = current_date - pd.Timedelta(days=day)
        if timezone != 'Australia/Sydney':
            event_results["created_at"] = event_results["created_at"].dt.tz_localize('Australia/Sydney')
            event_results["created_at"] = event_results["created_at"].dt.tz_convert(timezone)

        event_results['created_normalized'] = event_results['created_at'].dt.normalize()
        event_results = event_results[event_results['created_normalized'] > days_ago]
        
    event_results['created_normalized'] = event_results['created_at'].dt.normalize()
    skip_count_per_day = event_results[event_results['level'] == 100].groupby('created_normalized').size().reset_index()
    skip_count_per_day = skip_count_per_day.rename(columns= {"created_normalized": "date", 0: "count"})
    skip_count_per_day["date"] = pd.to_datetime(skip_count_per_day["date"]).dt.strftime('%Y-%m-%d')
    return skip_count_per_day.to_dict("records")

@app.route('/daily_averge_per_word/<user_id>/<day>/<country>/<city>', methods=['POST','GET'])
def daily_averge_per_word(user_id, day, country, city):
    timezone = f"{country}/{city}"
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT * FROM speaking_events WHERE user_id={user_id}"
        cursor.execute(query)
    event_results = cursor.fetchall()
    event_results = pd.DataFrame(event_results)
    if len(event_results) ==0:
        return []
    
    if day != "all":
        day = int(day)
        if timezone != 'Australia/Sydney':
            current_date = pd.Timestamp.now(tz=timezone).normalize()
        else:
            current_date = pd.Timestamp.now().normalize()
        days_ago = current_date - pd.Timedelta(days=day)
        if timezone != 'Australia/Sydney':
            event_results["created_at"] = event_results["created_at"].dt.tz_localize('Australia/Sydney')
            event_results["created_at"] = event_results["created_at"].dt.tz_convert(timezone)

        event_results['created_normalized'] = event_results['created_at'].dt.normalize()
        event_results = event_results[event_results['created_normalized'] > days_ago]
        
    if len(event_results) ==0:
        return []
    average_dur_per_day = (event_results.groupby('created_normalized')["duration"].mean()/1000).reset_index()
    average_dur_per_day["duration"] =average_dur_per_day["duration"].apply(lambda x: round(x, 2))
    average_dur_per_day = average_dur_per_day.rename(columns= {"created_normalized": "date"})
    average_dur_per_day["date"] = pd.to_datetime(average_dur_per_day["date"]).dt.strftime('%Y-%m-%d')
    return average_dur_per_day.to_dict("records")

@app.route('/get_static_one_paragraph/<user_id>/<para_id>', methods=['POST','GET'])
def get_static_one_paragraph(user_id, para_id):
    user_id = int(user_id)
    top_n = 2
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT * FROM speaking_done WHERE para_id='{para_id}'"
        cursor.execute(query)
    done_results = cursor.fetchall()
    done_results = pd.DataFrame(done_results)
    if len(done_results) == 0:
        return {
            "top_users": [],
            "user_trails": []
        }
    
    connection = make_conn()
    with connection.cursor() as cursor:
        query = f"SELECT * FROM users"
        cursor.execute(query)
    user_results = cursor.fetchall()
    user_results = pd.DataFrame(user_results)[["id","username", "email"]]

    top_df = (done_results.groupby('user_id')["duration"].min()).reset_index()
    top_df = top_df.sort_values(by='duration', ).reset_index(drop=True)
    top_df = top_df.reset_index()
    top_df["duration"] = round(top_df["duration"]/1000,2)
    user_position = top_df[top_df['user_id'] == user_id].index[0] if user_id in top_df['user_id'].tolist() else -1

    if user_position != -1:
        top_rows = top_df[:top_n]
        
        if user_position > top_n:
            user_row = top_df[top_df["user_id"] == user_id]
            top_rows = pd.concat([top_rows, user_row])
            
        user_trails = done_results[done_results["user_id"] == user_id]["duration"].reset_index()
        user_trails["duration"] = round(user_trails["duration"]/1000,4)
        user_trails = user_trails.to_dict("records")
    else:
        top_rows = top_df.head(top_n)
        user_trails = []
    top_rows["fill"] = top_rows["user_id"].apply(lambda x: "#28B463" if x == user_id else "#FDFEFE")
    top_rows = top_rows.merge(user_results,left_on="user_id", right_on="id")
    return {
            "top_users": top_rows.to_dict("records"),
            "user_trails": user_trails
        }

@app.route('/add_voca', methods=['POST'])
def add_voca():
    data = request.json
    connection = make_conn()
    with connection.cursor() as cursor:
        query = """
                INSERT INTO vocabularies (user_id, word, type, definition, status)
                SELECT %s, %s, %s, %s, %s FROM DUAL
                WHERE NOT EXISTS (
                    SELECT 1 FROM vocabularies 
                    WHERE user_id = %s AND word = %s AND type = %s AND definition = %s
                )
                """
        cursor.execute(query, (data['user_id'], data['word'], data['type'], data['definition'], 0, data['user_id'], data['word'], data['type'], data['definition']))
        connection.commit()
        return jsonify({"message": "Progress added successfully"}), 200
if __name__ == "__main__":
    app.run(debug=True, port=8888)