var allowed_headers = ['cache-control', 'expires']

module.exports = function(headers){
	var validation = false
	if (headers instanceof Array) {
		headers.forEach(function(curr){
			if (curr instanceof Object) {
				if (curr.source) {
					if (curr.headers instanceof Array) {
						curr.headers.forEach(function(header){
							if (!header.key || !header.value)
								throw new Error('Each object in headers array must have key and value properties')
							if (allowed_headers.indexOf(header.key.toLowerCase()) == -1) 
								throw new Error('Header ' + header.key + ' not allowed. You can only use this headers: ' + allowed_headers.toString())
						})
						validation = headers
					} else {
						throw new Error('The source ' + curr.source + ' hasn\'t the headers array')
					}
				} else {
					throw new Error('Missing source')	
				}
			} else {
				throw new Error('Each element in array headers must be an Object')
			}
		})
	} else {
		throw new Error('Headers must be an Array')
	}
	return validation
}