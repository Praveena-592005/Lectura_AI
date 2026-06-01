# Use Node.js 24
FROM node:24-slim

# Install system dependencies including curl for Deno and yt-dlp needs
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp globally
RUN pip3 install yt-dlp --break-system-packages

# Install Deno
ENV DENO_INSTALL="/root/.deno"
RUN curl -fsSL https://deno.land/install.sh | sh
ENV PATH="$DENO_INSTALL/bin:$PATH"

WORKDIR /app
COPY package*.json ./
RUN npm install 
COPY . .

EXPOSE 5000
CMD ["node", "server.js"]