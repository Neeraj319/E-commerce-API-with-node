#!/bin/bash
while ! nc -z db 5432; do sleep 0.1; done;

node models.js create_tables

yarn start
