# GitHub Actions CI/CD

This directory contains GitHub Actions workflows for automated testing and quality checks.

## Workflows

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)
**Comprehensive testing pipeline that runs on every push and pull request to main branch.**

- **Backend Tests**: Unit tests across Python 3.9-3.12
- **Frontend Tests**: Linting, type checking, and build verification
- **Security Scan**: Dependency vulnerability scanning
- **Integration Tests**: Full API testing with SQLite and PostgreSQL
- **Docker Build**: Container build verification
- **Code Quality**: Black, isort, flake8 checks
- **Performance Tests**: Load testing with Locust

### 2. Pull Request Checks (`.github/workflows/pr-checks.yml`)
**Essential checks for pull requests - faster and more reliable.**

- **Backend Checks**: Syntax validation, import testing, database creation
- **Frontend Checks**: Linting and build verification
- **Security Scan**: Basic security vulnerability checks
- **Code Quality**: Formatting and linting checks
- **Integration Test**: API endpoint verification

## Test Structure

```
tests/
├── __init__.py                    # Test package
├── test_main.py                   # Backend unit tests
└── integration/
    ├── __init__.py                # Integration test package
    └── test_api_integration.py    # Full API integration tests
```

## Frontend Testing

The frontend uses Vitest for testing:

```bash
cd frontend
npm run test          # Run tests
npm run test:coverage # Run with coverage
npm run type-check    # TypeScript validation
```

## Backend Testing

Backend uses pytest:

```bash
pytest tests/                    # Run all tests
pytest tests/test_main.py       # Run specific test file
pytest --cov=. --cov-report=html # Run with coverage
```

## Running Tests Locally

### Prerequisites
```bash
# Backend
pip install pytest pytest-asyncio pytest-cov httpx requests

# Frontend
cd frontend && npm install
```

### Quick Test
```bash
# Test backend syntax and imports
python -m py_compile main.py
python -c "from main import app; print('✓ Backend OK')"

# Test frontend build
cd frontend && npm run build
```

## Security Scanning

- **Python**: Uses `safety` and `bandit`
- **Node.js**: Uses `npm audit`
- **Dependency scanning**: Automated vulnerability detection

## Code Quality

- **Python**: Black (formatting), isort (imports), flake8 (linting)
- **TypeScript**: ESLint, TypeScript compiler

## Environment Variables for CI

- `DATABASE_URL`: Set to test database
- `GEMINI_API_KEY`: Set to test key for CI
- Coverage reports uploaded to Codecov (optional)

## Workflow Status

Check the Actions tab in GitHub to see the status of all workflows. The PR checks workflow is designed to be fast and reliable, while the full CI/CD pipeline provides comprehensive testing. 