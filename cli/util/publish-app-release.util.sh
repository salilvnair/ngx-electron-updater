#!/usr/bin/env sh

PACKAGE_VERSION="$(node -p "require('../package.json').version")"
RELEASE_DATE="$(date +'%d-%m-%Y')"
cat <<EOF >../app-release.json
{
     "name" : "vdemy",
     "version": "${PACKAGE_VERSION}",
     "date":"${RELEASE_DATE}" 
}
EOF

