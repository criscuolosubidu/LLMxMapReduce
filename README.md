# LLMxMapReduce

## Introduction

This project is developed based on LLMxMapReduce, maintaining the core architecture of the original pipeline while integrating databases and frontend/backend components to provide a better user experience.

## Features

- 🚀 Modern frontend interface built with Next.js
- 🔧 Flask backend API service
- 🗄️ Support for PostgreSQL and MongoDB databases
- 🔐 JWT authentication
- 📊 Data visualization and analysis
- 🤖 OpenAI API integration

## Tech Stack

### Backend
- Python 3.11
- Flask
- PostgreSQL
- MongoDB
- Redis
- OpenAI API

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI

## Installation Guide

### Prerequisites

- Python 3.11+
- Node.js 18+
- pnpm
- PostgreSQL
- MongoDB
- Redis
- Conda environment manager

### 1. Clone the Repository

```bash
git clone https://github.com/criscuolosubidu/LLMxMapReduce.git
cd LLMxMapReduce
```

### 2. Backend Environment Setup

#### Create Python Virtual Environment

```bash
conda create -n llm_mr_v2 python=3.11
conda activate llm_mr_v2
```

#### Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Frontend Environment Setup

#### Install Frontend Dependencies

```bash
cd ../frontend
pnpm install
```

### 4. Database Configuration

#### PostgreSQL Configuration
1. Install and start PostgreSQL service
2. Create database and user:
```sql
CREATE DATABASE llm_mapreduce;
CREATE USER pguser WITH PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE llm_mapreduce TO pguser;
```

#### MongoDB Configuration
1. Install and start MongoDB service
2. Create database:
```bash
use llm_mapreduce
```

#### Redis Configuration
1. Install and start Redis service

### 5. Environment Variables Configuration

Create a `.env` file in the `backend` directory, using `env.template` as reference:

```bash
cd backend
cp env.template .env
```

Edit the `.env` file and configure the following important parameters:

```env
# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=pguser
POSTGRES_PASSWORD=123456
POSTGRES_DB=llm_mapreduce

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/
MONGO_DATABASE=llm_mapreduce

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# API Keys
OPENAI_API_KEY=your-openai-api-key-here
SERPER_API_KEY=your-serper-api-key-here

# JWT Secret
JWT_SECRET_KEY=your-super-secret-jwt-key-here
```

## Running the Project

### Start Backend Service

```bash
cd backend
python app.py
```

The backend service will run on `http://localhost:5000`

### Start Frontend Service

```bash
cd frontend
pnpm run dev
```

The frontend service will run on `http://localhost:3000`

## Development Environment Configuration

### SMS Service Configuration (Optional)
If SMS functionality is needed, configure the relevant API keys in the `.env` file. For development environment, this configuration can be skipped.

### OpenAI API Configuration
Ensure you have a valid OpenAI API key:
```env
OPENAI_API_KEY=sk-xxxxxxxxxx
```

## Project Structure

```
LLMxMapReduce/
├── backend/                 # Flask backend application
│   ├── src/                # Source code
│   ├── config/             # Configuration files
│   ├── logs/               # Log files
│   ├── app.py              # Main application file
│   ├── requirements.txt    # Python dependencies
│   └── env.template        # Environment variables template
├── frontend/               # Next.js frontend application
│   ├── app/                # Next.js app routing
│   ├── components/         # React components
│   ├── lib/                # Utility libraries
│   ├── styles/             # Style files
│   └── package.json        # Node.js dependencies
├── assets/                 # Static assets
├── docker-compose.yml      # Docker configuration
└── README.md              # Project documentation
```


## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or suggestions, please contact us through:

- Create an Issue
- Send email to project maintainers

---

⭐ If this project helps you, please give it a star!
