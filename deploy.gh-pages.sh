#!/usr/bin/env sh

# build

npm run build-gh-pages

# copy stylesheets
cp styles/*.css ./gh-pages-dist/assets

# copy example images
mkdir ./gh-pages-dist/images
cp images/*.png ./gh-pages-dist/images

git add gh-pages-dist && git commit -m 'chore: gh-pages dist files'

git subtree push --prefix gh-pages-dist origin gh-pages
