FROM python:3.12

RUN mkdir frontend

COPY . frontend/

WORKDIR /frontend/

EXPOSE 8001

CMD ["python3", "-m", "http.server", "8001", "--bind", "0.0.0.0"]