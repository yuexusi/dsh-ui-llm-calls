#!/bin/sh
# Assemble the hand-maintained client bundle from its ordered source parts.
set -eu
cd "$(dirname "$0")"
cat src/01-head.js src/02-locale.js src/03-helpers.js src/04-definitions.js \
    src/05-builder.js src/06-css.js src/07-view-parts.js src/08-view.js src/09-apply.js \
    > lib/client.js
node --check lib/client.js
echo "built lib/client.js ($(wc -c < lib/client.js) bytes)"
