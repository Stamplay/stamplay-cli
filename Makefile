stamplay:
				@mocha ./test/bin/deploy.js
				@mocha ./test/bin/download.js
				@mocha ./test/bin/help.js
				@mocha ./test/bin/init.js
				@mocha ./test/bin/open.js
				@mocha ./test/bin/start.js
				@mocha ./test/bin/version.js