FROM node:20-alpine AS base
WORKDIR /app
# poppler-utils provides pdftoppm, used by the book-rendering pipeline
# (Phase 4) to rasterize PDF pages. This is a system binary, so it goes
# in the image rather than package.json.
RUN apk add --no-cache poppler-utils
COPY package.json package-lock.json* ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN npm install --workspaces --if-present
RUN npm run build --workspace=apps/api
EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
