#!/bin/bash

python - > /tmp/resume.html <<PYTHON
import re
with open('_site/resume/index.html', 'r') as f:
  t = f.read()
  t = re.sub(r'<header[^>]*>.*</header>', '', t, flags=re.DOTALL)
  t = re.sub(r'<footer[^>]*>.*</footer>', '', t, flags=re.DOTALL)
  print(t)
PYTHON

weasyprint -s _site/assets/main.css /tmp/resume.html /tmp/resume.pdf && open /tmp/resume.pdf
