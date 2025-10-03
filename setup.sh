#!/bin/bash

# Install dependencies
npm install

# Create next-env.d.ts if it doesn't exist
if [ ! -f "next-env.d.ts" ]; then
  echo "/// <reference types=\"next\" />" > next-env.d.ts
  echo "/// <reference types=\"next/image-types/global\" />" >> next-env.d.ts
fi

echo "Setup complete! Run 'npm run dev' to start the development server."
