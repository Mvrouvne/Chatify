FROM python:3.12

RUN pip install pipenv

COPY ../Pipfile ../Pipfile.lock ./

RUN mkdir backend

COPY backend/ backend/

WORKDIR /backend/

RUN pipenv install --ignore-pipfile

EXPOSE 8000

WORKDIR /backend/

CMD ["pipenv", "run", "sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]