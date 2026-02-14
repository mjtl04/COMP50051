DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
CREATE TABLE roles(
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    leave_balance INT NOT NULL,
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
);
CREATE TABLE user_management(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    manager_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE TABLE leave_status(
    id SERIAL PRIMARY KEY,
    status VARCHAR(255)
);
CREATE TABLE leave_types(
    id SERIAL PRIMARY KEY,
    type VARCHAR(255)
);
CREATE TABLE leave_requests(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    type_id INT NOT NULL,
    status_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    comment VARCHAR(500),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_type FOREIGN KEY (type_id) REFERENCES leave_types(id),
    CONSTRAINT fk_status FOREIGN KEY (status_id) REFERENCES leave_status(id)
);