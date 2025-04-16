# Customer Data Platform (CDP API)

This project is a full-featured Customer Data Platform (CDP) built using FastAPI, offering cohort-based user segmentation, real-time and batch data ingestion, Kafka integration for scalable streaming, machine learning-based predictions, and a user-friendly Next.js frontend dashboard.

[![Swagger UI](https://img.shields.io/badge/Swagger%20UI-%2Fdocs-brightgreen)](https://cdpapi-demo.onrender.com)
[![Vercel Deployment](https://vercel.com/button)](https://cd-papi-demo.vercel.app)

## Features

* **FastAPI Backend:** Robust and efficient API built with FastAPI, featuring interactive API documentation via Swagger UI (`/docs`).
* **Data Ingestion:** Supports both batch ingestion (uploading CSV files) and real-time ingestion of user data.
* **User Segmentation:**
    * **ML-based Cohort Prediction:** Predicts user cohort membership using machine learning models based on user interests.
    * **Rule-based Segmentation:** Allows for defining segments based on specific user attributes.
* **Persistent Storage:** Utilizes SQLite database for reliable storage of user profiles and data.
* **Scalable Real-time Ingestion (Local):** Integrated with Kafka for handling high-volume, real-time data streams.
* **Next.js Frontend Dashboard:** Intuitive web interface built with Next.js for visualizing user data and segments, deployed via Vercel.
* **Deployment Ready:** Includes Docker and Render configuration for easy deployment of the backend.
* **Modular Design:** Well-organized API router structure for maintainability and scalability.

## Folder Structure
```
CDPapi/
├── cdp-dashboard/         # Next.js frontend
├── logs/                 # Logging output
├── models/               # Model .pkl files for prediction
├── public/               # Public static files
├── raw_uploads/          # Uploaded raw CSVs
├── src/                  # Main application logic
│   ├── api/              # FastAPI routers (user, cohort, prediction, segment)
│   ├── batch_clean.py
│   ├── bulk_ingest.py
│   ├── crud.py
│   ├── cohort_prediction.py
│   ├── kafka_consumer.py
│   ├── kafka_producer.py
│   └── main.py
├── test/                 # Test scripts and experimental files
├── user_profiles.db      # SQLite DB file
├── render.yaml           # Render deployment config
├── docker-compose.yaml   # Docker multi-service setup
└── requirements.txt     # Python dependencies
```

## Getting Started

### Backend Setup (FastAPI)

1.  Navigate to the backend directory:
    ```bash
    cd CDPapi
    ```

2.  Create a virtual environment:
    ```bash
    python -m venv venv
    ```

3.  Activate the virtual environment:
    * **On Linux/macOS:**
        ```bash
        source venv/bin/activate
        ```
    * **On Windows:**
        ```bash
        venv\\Scripts\\activate
        ```

4.  Install the required Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

5.  Navigate to the `src` directory:
    ```bash
    cd src
    ```

6.  Run the FastAPI application using Uvicorn:
    ```bash
    uvicorn main:app --reload
    ```

7.  Open your browser to access the interactive Swagger UI:
    ```
    [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
    ```

### Frontend Setup (Next.js Dashboard)

1.  Navigate to the frontend directory:
    ```bash
    cd cdp-dashboard
    ```

2.  Install the Node.js dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Access the frontend dashboard in your browser:
    ```
    http://localhost:3000
    ```

5.  **Environment Variables:** Create a `.env.local` file in the `cdp-dashboard` directory and set the API URL for the backend:
    ```
    NEXT_PUBLIC_API_URL=[https://cdpapi-backend.onrender.com](https://cdpapi-backend.onrender.com)
    ```
    *(Note: This is the production URL. When running locally, you might want to use `http://localhost:8000`)*

## API Endpoints

Here's a list of the available API endpoints:

* **`POST /bulk-ingest`**: Upload a CSV file for batch ingestion of user data.
* **`GET /clean-users`**: Clean and preprocess user data (details in `batch_clean.py`).
* **`POST /ingest-single/bulk-json`**: Ingest a single user's data in JSON format.
* **`GET /api/users`**: Retrieve a list of all users.
* **`GET /api/cohort/users?cohort=xyz`**: Get a list of users belonging to a specific cohort (`xyz`).
* **`POST /predict-cohort`**: Predict the cohort for a given user based on their interests.
* **`POST /train`**: Train the machine learning model for cohort prediction.
* **`GET /api/stats`**: Retrieve platform statistics.
* **`/docs`**: Interactive Swagger UI for exploring and testing the API.

## Machine Learning Models

* **Cohort Classification:** Utilizes a TF-IDF (Term Frequency-Inverse Document Frequency) vectorizer combined with a Logistic Regression model to classify users into cohorts based on their interests.
* **(Not Deployed) Bio Segmentation:** A BERT-based Natural Language Processing (NLP) pipeline was trained for user segmentation based on their bios. However, this model was not included in the final deployment due to its large size.
* The trained machine learning models are stored as `.pkl` files in the `/models/` directory and are loaded for prediction and inference within the API calls.

## Kafka Integration

Kafka was implemented to demonstrate a scalable, real-time data ingestion pipeline.

* **`kafka_producer.py`**: Contains the logic to push incoming user data to a specified Kafka topic.
* **`kafka_consumer.py`**: Consumes data from the Kafka topic, performs model-based predictions, and ingests the data into the database.

**Note:** The Kafka integration is commented out in the `main.py` file for cloud deployment on Render. To enable it locally, you would need to uncomment the relevant sections and ensure a local Kafka instance is running.

## Deployment

### Backend (Render)

The FastAPI backend is configured for deployment on Render using the `render.yaml` file. Render automatically builds and deploys the application based on this configuration.

### Frontend (Vercel)

The Next.js frontend dashboard is deployed on Vercel. Vercel automatically detects the Next.js project and provides seamless deployment. The `.env.local` file in the frontend is used to configure the API URL to point to the deployed backend on Render (`https://cdpapi-backend.onrender.com`).

### Docker Support

A `docker-compose.yaml` file is included to facilitate containerized deployment using Docker. You can build and run the entire application (including potential future services) using the following command:

```bash
docker-compose up --build
```

# Future Enhancements

## Authentication & Authorization:
  Add API key or JWT-based authentication for secure access.
  Implement role-based access control (admin vs. viewer).
## Kafka Integration in Production:
  Uncomment and fully enable kafka_routes.py.
  Deploy a Kafka broker using docker-compose or a managed Kafka service (e.g., Confluent Cloud).
  Async/Await for Full Backend:
  Refactor database calls and route handlers to be asynchronous (async def, asyncpg, SQLAlchemy async engine).
## Cloud Database Support:
  Replace the local SQLite database with PostgreSQL for improved production scalability.
## Dashboard Enhancements:
  Add filtering capabilities for users (by date, cohort, etc.).
  Implement search and sorting functionalities for user data.
  Include more insightful charts, such as segment trends over time.
## Scheduling via Airflow:
  Automate batch ingestion, model retraining, and data cleaning jobs using Apache Airflow or Prefect.
## Model Monitoring:
  Implement drift detection mechanisms and periodic evaluation metrics for machine learning models.
## Notifications:
  Add email or Slack notifications to inform users about the completion of ingestion jobs or model training runs.
## Deployment Optimizations:
  Implement a CI/CD (Continuous Integration/Continuous Deployment) pipeline for automated deployments.
  Enable HTTPS for secure communication.
  Utilize Docker secrets for secure management of environment variables.
## Frontend Auth & Access Control:
  Add a login screen for accessing the dashboard using libraries like NextAuth.js or Firebase Auth.

# Credits
#### Developed by: Dhaneshwaran Ponnurangam
#### Frontend: Next.js, Tailwind CSS, Shadcn UI
####  Backend: FastAPI, SQLAlchemy, SQLite
####  Machine Learning: Scikit-learn, Hugging Face Transformers (BERT - not fully deployed)
### License
#### For academic and demo use only.

