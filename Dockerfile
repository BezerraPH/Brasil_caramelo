FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

# Next.js avalia rotas no build; precisa de URL (o Postgres real só na execução)
ENV DATABASE_URL=postgresql://caramelo:caramelo_secret@db:5432/brasil_caramelo

RUN npx prisma generate
RUN npm run build

EXPOSE 3000
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
