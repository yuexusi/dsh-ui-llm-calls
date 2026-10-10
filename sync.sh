#!/bin/sh
# Rebuild the client bundle, sync it into the installed profile copy, and
# trigger the running host's live recomposition.
set -eu
cd "$(dirname "$0")"
./build.sh
DEST="$HOME/.dsh/profiles/web/node_modules/dsh-ui-llm-calls"
cp --remove-destination lib/client.js lib/index.js package.json cordis.patch.yml "$DEST/"
cp --remove-destination lib/client.js "$DEST/lib/client.js"
# The host's HMR watches the profile manifest and patch files; a real content
# change recomposes reliably (an mtime-only touch does not always fire).
PATCH="$HOME/.dsh/profiles/web/cordis.patch.yml"
cp --remove-destination "$PATCH" "$PATCH.llm-calls-sync.bak"
printf '\n# llm-calls sync trigger\n' >> "$PATCH"
sleep 4
mv "$PATCH.llm-calls-sync.bak" "$PATCH"
echo "synced to profile and recomposed"
