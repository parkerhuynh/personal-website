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
    progress VARCHAR(1024)       NOT NULL,
    important TINYINT(1)        NOT NULL,
    created_at TIMESTAMP(6)     DEFAULT CURRENT_TIMESTAMP(6)
);

