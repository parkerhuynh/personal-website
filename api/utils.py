import pymysql.cursors
import pymysql

def connect_to_mysql():
    return pymysql.connect(host='localhost',
                           user='root',
                           password='12341234',
                           db='cartoon',
                           charset='utf8mb4',
                           cursorclass=pymysql.cursors.DictCursor)

def make_conn(db="personal"):
    return pymysql.connect(
        host='localhost',
        user='root',
        password='12341234',
        db=db,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )