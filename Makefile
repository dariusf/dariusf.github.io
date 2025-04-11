
.PHONY: all
all:
	npx @11ty/eleventy --serve

# css changes won't trigger a rebuild of blog posts in incremental mode,
# among other problems. so just use this when in a content authoring cycle.
.PHONY: inc
inc:
	npx @11ty/eleventy --serve --incremental

# https://www.11ty.dev/docs/debug-performance/
.PHONY: debug
debug:
	# DEBUG=Eleventy* npx @11ty/eleventy --serve
	DEBUG=Eleventy:Image npx @11ty/eleventy --serve --incremental
	# DEBUG=* npx @11ty/eleventy --serve
	# DEBUG=Eleventy:Benchmark* npx @11ty/eleventy --serve

.PHONY: build
build:
	npx @11ty/eleventy