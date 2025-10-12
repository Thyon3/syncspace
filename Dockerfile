# -------------------------------
# Step 1: Base image
# -------------------------------
FROM node:18

# -------------------------------
# Step 2: Set working directory
# -------------------------------
WORKDIR /app

# -------------------------------
# Step 3: Copy all project files
# -------------------------------
COPY . .

# -------------------------------
# Step 4: Install dependencies
# -------------------------------
RUN npm install --prefix backend
RUN npm install --prefix frontend

# -------------------------------
# Step 5: Build frontend
# -------------------------------
RUN npm run build --prefix frontend

# -------------------------------
# Step 6: Set environment variables
# -------------------------------
ENV NODE_ENV=production
ENV PORT=3000

# -------------------------------
# Step 7: Expose the port
# -------------------------------
EXPOSE 3000

# -------------------------------
# Step 8: Start backend
# -------------------------------
CMD ["npm", "run", "start", "--prefix", "backend"]
