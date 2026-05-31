# Use Node.js 24
FROM node:24-slim

# Install system dependencies (ffmpeg and python for yt-dlp)
# Also include build tools if any of your current npm packages need them
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp globally
RUN pip3 install yt-dlp --break-system-packages

WORKDIR /app
COPY package*.json ./
# This installs all your existing dependencies (mammoth, pdf-parse, etc.)
RUN npm install 
COPY . .

EXPOSE 5000
CMD ["node", "server.js"]