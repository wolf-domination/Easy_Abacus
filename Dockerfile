FROM python:3.9.18-alpine3.18

RUN apk add build-base

RUN apk add postgresql-dev gcc python3-dev musl-dev

ARG FLASK_APP
ARG FLASK_ENV
ARG DATABASE_URL
ARG SCHEMA
ARG SECRET_KEY

WORKDIR /var/www

COPY requirements.txt .

RUN pip install -r requirements.txt
RUN pip install psycopg2

COPY . .

CMD python -c "from app import app; from app.models import db; app.app_context().push(); db.drop_all(); db.create_all()" && flask seed all && gunicorn app:app