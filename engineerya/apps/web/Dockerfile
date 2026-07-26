FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN npm install --workspaces --if-present
RUN npm run build --workspace=apps/web
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=apps/web"]
