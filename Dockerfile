FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install --ignore-scripts
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --schema=prisma/schema.prisma --skip-generate && npm start"]
