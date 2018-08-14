const fs = require("fs")
const fetch = require("node-fetch")


const stocks_to_fetch = require("./stocks.json")

/**
To get session vars:
Go to something like https://finance.yahoo.com/quote/V/history?p=V&.tsrc=fin-srch-v1
1. Click "download"
2. Inspect the network request for that GET
Now:
1. Grab the crumb from the GET url
2. Grab the cookie by using "Edit and Resend"
*/
const session_variables = {
	crumb: 'kSV0V9hfRSo',
	cookie: 'B=7akvu71dn650g&b=3&s=2t; GUCS=AdDxK0dB; GUC=AQEBAQFbdFhcQ0IegQQr&s=AQAAAKIpQiVk&g=W3MUNg; PRF=t%3DMCD%252B%255EGSPC'
}
const url = (ticker) => 'https://query1.finance.yahoo.com/v7/finance/download/' + ticker +
	'?period1=0' +
	'&period2=1534222800' +
	'&interval=1wk' +
	'&events=history' +
	'&crumb=' + session_variables["crumb"]


let stored = 0
const store_stock_data = (ticker, data) => {
	fs.writeFileSync(`./data/${ticker}.csv`, data, 'utf8')
	if (++stored % 10 === 0) {
		console.log("stored:", stored)
	}
}
const error_for = (ticker, error) => {
	console.error('Error:', ticker, error)
	failures.push(ticker)
}

const fetch_stock = ticker => {
	return fetch(url(ticker) , {
	    credentials: 'include',
	    method: 'GET',
	    headers: {
	        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	        'Cookie': session_variables["cookie"]
	    }
	}).then(res => res.text())
}
console.log("running through stocks")
stocks_to_fetch.forEach(async ticker => {
	let retry = true
	while (retry === true) {
		retry = false
		try {
			const data = await fetch_stock(ticker)
			store_stock_data(ticker,data)
		}
		catch (e) {
			if (e.code === "ECONNRESET") {
				retry = true
				console.log("retrying", ticker)
			}
			else
				error_for(ticker, error)
		}
	}
})