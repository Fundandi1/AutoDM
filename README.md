# AutoDM - Instagram Automation Platform

AutoDM is an AI-powered Instagram automation platform that helps businesses find, target, and message potential clients automatically. It handles everything from identifying ideal prospects to sending personalized messages and follow-ups—all while maintaining a natural, human-like presence that doesn't risk account safety.

## Features

- **Intelligent Lead Generation**: AI-powered target finding to identify ideal clients
- **Advanced Lead Filtering**: Filter by engagement, followers, profile completeness
- **Personalized Messaging at Scale**: Dynamic message templates with variables
- **Intelligent Follow-Up Sequences**: Multi-step sequences with optimized timing
- **Multi-Account Management**: Manage multiple Instagram accounts from one dashboard
- **Analytics and Reporting**: Track campaigns, response rates, and ROI

## Tech Stack

- **Backend**: Python, Flask, MongoDB
- **Frontend**: React, TailwindCSS
- **Automation**: Playwright for Instagram interaction
- **Processing**: Redis for task queue
- **Authentication**: JWT for secure API access

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB
- Redis

### Installation

1. Clone the repository
2. Install Python dependencies: `pip install -r requirements.txt`
3. Install Playwright browsers: `playwright install`
4. Create a `.env` file (see `.env.example`)
5. Add Instagram accounts to `profiles.txt` (see `profiles_example.txt`)
6. Start the Flask server: `python server.py`
7. For the frontend: `cd frontend && npm install && npm start`

## Development

This project includes both local development mode and a cloud-based architecture for production deployment with Docker and Docker Compose.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Contact

For questions or support, please email support@autodm.com 