#!/bin/sh
git push origin master
git push origin master:gh-pages
rm ../masterproject.zip
git archive --format zip --output ../masterproject.zip master 
