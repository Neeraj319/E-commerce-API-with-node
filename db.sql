CREATE TABLE person(
    p_id BIGSERIAL PRIMARY KEY NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(120) NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    joined_on timestamp NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE customer(
    c_id BIGSERIAL PRIMARY KEY NOT NULL,
    address VARCHAR(50) NOT NULL,
    person_id BIGINT UNIQUE NOT NULL,
    FOREIGN KEY (person_id) REFERENCES person(p_id) ON DELETE CASCADE
);

CREATE TABLE seller(
    s_id BIGSERIAL PRIMARY KEY NOT NULL,
    person_id BIGINT UNIQUE NOT NULL,
    FOREIGN KEY (person_id) REFERENCES person(p_id) ON DELETE CASCADE
);

CREATE TABLE product(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(50) NOT NULL,
    des TEXT NOT NULL,
    price float NOT NULL,
    category VARCHAR(50) NOT NULL
);

CREATE TABLE cart (
    id BIGSERIAL PRIMARY KEY NOT NULL,
    product_id BIGINT UNIQUE NOT NULL,
    customer_id BIGINT UNIQUE NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customer(c_id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES product(id) ON DELETE CASCADE
);



CREATE TABLE order_product(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    customer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    delivery_date date NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customer(c_id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES product(id) ON DELETE CASCADE,
    product_packed BOOL default false NOT NULL,
    product_shipped BOOL  default false NOT NULL,
    product_delivered BOOL default false NOT NULL
);
