# Student Management System (Microservices-based)

A secure and scalable Student Management System built using a microservices architecture. Designed to separate concerns into individual services with JWT-based authentication and role-based access control.

## 🔐 Key Features

- **Microservice Architecture**: Independent services for authentication, students, professors, and courses.
- **JWT Authentication**: Role-based JWT tokens (RS256) for both users and service-to-service communication.
- **Role-Based Access**: Professors can access student/course data; students have limited permissions.
- **Asymmetric Encryption**: Used public/private key pairs (RS256) for signing/verifying JWTs.
- **Rate Limiting**: Prevents brute-force login attempts.
- **Centralized Logging**: Correlated logs with Elasticsearch and Kibana.
- **API Testing**: Fully tested endpoints with Postman using proper JWT auth headers.

## 🛠 Tech Stack

- Node.js, Express.js
- MongoDB
- Redis
- JWT (RS256 asymmetric encryption)
- Elasticsearch & Kibana
- Postman
