#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
npx -y netlify-cli login
npx -y netlify-cli link --name balkanflexforum
npx -y netlify-cli deploy --prod --dir=public --functions=netlify/functions
echo "Gotovo: https://balkanflexforum.netlify.app"
