FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install --ignore-scripts
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["sh", "-c", "node scripts/migrate.mjs && npm start"]
