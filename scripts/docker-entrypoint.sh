#!/bin/sh
set -e
echo "Running database migrations..."
./node_modules/.bin/prisma migrate deploy --schema=./apps/server/prisma/schema.prisma
echo "Starting server..."
exec node apps/server/dist/index.js
