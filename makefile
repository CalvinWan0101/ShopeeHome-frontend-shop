run:
	open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security 'http://localhost:5173/Seller'
	npm run dev

install:
	npm i

clean:
	rm -rf node_modules