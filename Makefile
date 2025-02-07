
all:
	npx @11ty/eleventy --serve

# css changes won't trigger a rebuild of blog posts in incremental mode,
# among other problems. so just use this when in a content authoring cycle.
inc:
	npx @11ty/eleventy --serve --incremental

build:
	npx @11ty/eleventy