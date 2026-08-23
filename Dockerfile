FROM node:22-alpine

WORKDIR /app

# Augmenter la mémoire allouée au build
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Installation des dépendances dans l'environnement Linux
COPY package*.json ./
RUN npm install

# Copie du code source et build de l'application Nuxt
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

EXPOSE 3001

# Démarrage du serveur Nuxt SSR
CMD ["node", ".output/server/index.mjs"]