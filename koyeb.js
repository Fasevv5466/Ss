name: kira-supreme
services:
  - name: kira-bot
    ports:
      - port: 8000
        protocol: http
    env:
      - name: NODE_ENV
        value: production
      - name: PORT
        value: "8000"
    scaling:
      min: 1
      max: 1
    health_checks:
      http:
        path: /health
        port: 8000
        interval: 30
        timeout: 10
        unhealthy_threshold: 3
        healthy_threshold: 2
    build:
      dockerfile: Dockerfile
      target: none
