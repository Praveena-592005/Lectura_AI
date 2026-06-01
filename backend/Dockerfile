# Use Node.js 24
FROM node:24-slim

# Install system dependencies
# ffmpeg for audio, python for yt-dlp, curl/unzip for Deno installation
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    build-essential \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp globally
RUN pip3 install yt-dlp --break-system-packages

# Install Deno
ENV DENO_INSTALL="/root/.deno"
RUN curl -fsSL https://deno.land/install.sh | sh
ENV PATH="$DENO_INSTALL/bin:$PATH"

# Set Deno as the default runtime for yt-dlp
ENV YT_DLP_JS_RUNTIME="deno"

WORKDIR /app
COPY package*.json ./
RUN npm install 
COPY . .

# Ensure the cookies.txt file is copied into the image
# Make sure you have a 'cookies.txt' file in your project root

EXPOSE 5000
CMD ["node", "server.js"]