#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Convert static assets into the STATIC_ROOT folder
python manage.py collectstatic --no-input

# Run database migrations
python manage.py migrate