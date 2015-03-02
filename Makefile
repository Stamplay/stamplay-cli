stamplay:
				@mocha test/stamplay.js -u tdd
				@cd test/bin && mocha command.js
