#!/usr/bin/env python

import yaml
import re
from weasyprint import HTML, CSS
import os

with open('_config.yml') as f:
  url = yaml.load(f, Loader=yaml.SafeLoader)['url']

with open('_site/resume/index.html', 'r') as f, open('/tmp/resume.html', 'w') as g:
  t = f.read()
  t = re.sub(r'<header[^>]*>.*</header>', '', t, flags=re.DOTALL)
  t = re.sub(r'<footer[^>]*>.*</footer>', '', t, flags=re.DOTALL)
  t = re.sub(r'http://localhost:4000', url, t, flags=re.DOTALL)
  g.write(t)

HTML('/tmp/resume.html').render(stylesheets=[CSS('_site/assets/main.css')]).write_pdf('/tmp/resume.pdf')

os.system('open /tmp/resume.pdf')
