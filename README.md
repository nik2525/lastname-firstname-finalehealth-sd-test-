# Patient & Visit Management System

A full-stack web application for managing patient and medical visits, built with modern web technologies.

## Features

### Patient Management
- Create, view, update, and delete patient records
- Store comprehensive patient information including:
  - Personal details (name, email, phone)
  - Demographic information (date of birth, gender, address)
  - Visit history

### Visit Management
- Schedule and track patient visits
- Record visit details including:
  - Visit date and time
  - Type of visit (e.g., Checkup, Follow-up)
  - Clinical notes and observations
- View visit history per patient

### User Interface
- Modern, responsive design
- Intuitive forms for data entry
- Search and filter functionality
- Clean, organized display of patient and visit information

## Technology Stack

### Frontend
- **Framework**: Angular 15+
- **UI Components**: Angular Material
- **State Management**: RxJS
- **Build Tool**: Angular CLI

### Backend
- **Runtime**: Node.js
- **Framework**: NestJS
- **Database**: MongoDB with Mongoose ODM
- **API**: RESTful architecture

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- MongoDB (v5.0 or higher)
- Angular CLI (for frontend development)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the Backend directory with the following content:
   ```
   MONGODB_URI=mongodb://localhost:27017/healthcare_db
   PORT=3000
   ```

4. Start the backend server:
   ```bash
   npm run start:dev
   ```
   The API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```
   The application will be available at `http://localhost:4200`

## Project Structure

```
Final_v2/
├── Backend/               # Backend server code
│   ├── src/
│   │   ├── patients/     # Patient-related functionality
│   │   ├── visits/       # Visit-related functionality
│   │   ├── app.module.ts # Main application module
│   │   └── main.ts       # Application entry point
│   └── ...
│
└── Frontend/             # Frontend Angular application
    ├── src/
    │   ├── app/
    │   │   ├── features/
    │   │   │   ├── patients/  # Patient management
    │   │   │   └── visits/    # Visit management
    │   │   ├── shared/        # Shared components and services
    │   │   └── ...
    │   └── ...
    └── ...
```

## Development

### Running Tests

Backend tests:
```bash
cd Backend
npm test
```

Frontend tests:
```bash
cd Frontend
ng test
```

### Building for Production

Backend production build:
```bash
cd Backend
npm run build
npm run start:prod
```

Frontend production build:
```bash
cd Frontend
ng build --configuration production
```




# Healthcare Management System API

This is the backend API for the Healthcare Management System, built with NestJS and MongoDB. It provides endpoints for managing patients and their medical visits.

## Base URL

```
http://localhost:4200/
```

## Authentication

This API currently does not implement authentication. All endpoints are publicly accessible.

## API Endpoints

### Patients

#### Get All Patients

```http
GET /patients
```

**Query Parameters:**
- `search` (optional): Search term to filter patients by name or email
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 10): Number of items per page

**Example Response:**
```json
{
  "data": [
    {
      "_id": "60d5ec9f1c9d440000a12345",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "dateOfBirth": "1980-01-01T00:00:00.000Z",
      "gender": "male",
      "address": "123 Main St, Anytown, USA"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

#### Get Single Patient

```http
GET /patients/:id
```

**Example Response:**
```json
{
  "_id": "60d5ec9f1c9d440000a12345",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1980-01-01T00:00:00.000Z",
  "gender": "male",
  "address": "123 Main St, Anytown, USA",
  "dateCreated": "2023-06-25T10:30:00.000Z",
  "dateUpdated": "2023-06-25T10:30:00.000Z"
}
```

#### Create Patient

```http
POST /patients
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1980-01-01",
  "gender": "male",
  "address": "123 Main St, Anytown, USA"
}
```

**Required Fields:** `firstName`, `lastName`, `email`

#### Update Patient

```http
PATCH /patients/:id
```

**Request Body:**
```json
{
  "phone": "+1987654321",
  "address": "456 Oak Ave, Somewhere, USA"
}
```

#### Delete Patient

```http
DELETE /patients/:id
```

### Visits

#### Get All Visits

```http
GET /visits
```

**Query Parameters:**
- `patientId` (optional): Filter visits by patient ID
- `visitType` (optional): Filter by visit type (e.g., "Checkup", "Follow-up")
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 10): Number of items per page
- `sortBy` (optional, default: "visitDate"): Field to sort by
- `sortOrder` (optional, default: "desc"): Sort order ("asc" or "desc")

**Example Response:**
```json
{
  "data": [
    {
      "_id": "60d5ed1a1c9d440000a12346",
      "patientId": "60d5ec9f1c9d440000a12345",
      "visitDate": "2023-06-26T09:00:00.000Z",
      "visitType": "Checkup",
      "notes": "Annual physical examination",
      "patient": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

#### Create Visit

```http
POST /patients/:patientId/visits
```

**Request Body:**
```json
{
  "visitDate": "2023-07-15T10:00:00.000Z",
  "visitType": "Follow-up",
  "notes": "Follow-up appointment"
}
```

**Required Fields:** `visitDate`, `visitType`

#### Update Visit

```http
PATCH /visits/:id
```

**Request Body:**
```json
{
  "notes": "Updated notes about the visit"
}
```

#### Delete Visit

```http
DELETE /visits/:id
```

## Error Handling

Errors are returned in the following format:

```json
{
  "statusCode": 404,
  "message": "Patient not found",
  "error": "Not Found"
}
```

### Common Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (e.g., duplicate email)
- `500 Internal Server Error`: Server error

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/healthcare_db
   PORT=3000
   ```

3. Start the development server:
   ```bash
   npm run start:dev
   ```

## Testing

Run the test suite:

```bash
npm test
```








