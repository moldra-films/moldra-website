#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "========================================="
echo "   MOLDRA ENGINE (STUDIO FLOW) SETUP   "
echo "========================================="

# Determine absolute path of script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed on this system."
    echo "Please install Python 3 (via Brew or python.org) and try again."
    exit 1
fi

echo "✓ Python 3 detected: $(python3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment (venv)..."
    python3 -m venv venv
    echo "✓ Virtual environment created."
else
    echo "✓ Virtual environment already exists."
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "🚀 Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📥 Installing dependencies from requirements.txt..."
pip install -r requirements.txt

echo "========================================="
echo "✓ Setup completed successfully!"
echo "🚀 Booting up FastAPI local server..."
echo "Press Ctrl+C to stop."
echo "========================================="

# Launch FastAPI app
python main.py
