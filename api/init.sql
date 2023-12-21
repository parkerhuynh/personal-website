CREATE DATABASE IF NOT EXISTS personal;
USE personal;

CREATE TABLE IF NOT EXISTS users (    
    id INT AUTO_INCREMENT   PRIMARY KEY,
    username VARCHAR(32)    NOT NULL,
    email VARCHAR(64)       NOT NULL,
    password VARCHAR(64)    NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX(username, email)
);

CREATE TABLE IF NOT EXISTS progress (
    id INT AUTO_INCREMENT       PRIMARY KEY,
    user_id INT                 NOT NULL,
    username VARCHAR(32)        NOT NULL,
    objective VARCHAR(1024)       NOT NULL,
    progress MEDIUMTEXT       NOT NULL,
    important TINYINT(1)        NOT NULL,
    created_at TIMESTAMP(6)     DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE TABLE IF NOT EXISTS deadlines (
    id INT AUTO_INCREMENT       PRIMARY KEY,
    user_id INT                 NOT NULL,
    username VARCHAR(32)        NOT NULL,
    end_date VARCHAR(32)        NOT NULL,
    notification INT            NOT NULL,
    objective  TEXT             NOT NULL,
    note   TEXT                 NOT NULL,
    status TEXT                 NOT NULL,
    timezone TEXT               NOT NULL,
    offset TEXT                 NOT NULL,
    created_at TIMESTAMP(6)     DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE TABLE IF NOT EXISTS papers (
    id INT AUTO_INCREMENT       PRIMARY KEY,
    user_id INT                 NOT NULL,
    paper TEXT                  NOT NULL,
    author TEXT                 NOT NULL,
    conference TEXT              NOT NULL,
    year INT                    NOT NULL,
    name  TEXT                          ,
    img_encoder TEXT            NOT NULL,
    ques_encoder  TEXT          NOT NULL,
    fusion   TEXT               NOT NULL,
    datasets TEXT               NOT NULL,
    results TEXT                NOT NULL,
    paperid TEXT                NOT NULL,
    problems MEDIUMTEXT               ,
    contribute LONGTEXT             ,
    structure MEDIUMTEXT              ,
    abstract TEXT               ,
    category TEXT               ,
    url TEXT               ,
    created_at TIMESTAMP(6)     DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE TABLE IF NOT EXISTS speaking_para (
    id INT AUTO_INCREMENT       PRIMARY KEY,
    user_id INT                 NOT NULL,
    para_id TEXT                NOT NULL,
    title  TEXT                 NOT NULL,
    topic  TEXT                 NOT NULL,
    content TEXT                NOT NULL,
    created_at TIMESTAMP(6)     DEFAULT CURRENT_TIMESTAMP(6)
);

-- CREATE TABLE IF NOT EXISTS speaking_done (
--     id INT AUTO_INCREMENT       PRIMARY KEY,
--     user_id INT                 NOT NULL,
--     topic  TEXT             NOT NULL,
--     para_id INT                 NOT NULL,
--     created_at TIMESTAMP(6)     DEFAULT CURRENT_TIMESTAMP(6)
-- );

CREATE TABLE IF NOT EXISTS list_to_do (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date TEXT NOT NULL,
    complete TINYINT(1) NOT NULL,
    task LONGTEXT NOT NULL,
    task_id TEXT NOT NULL
);


