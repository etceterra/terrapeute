help:
	@echo "Checkout the makefile"

deploy:
	ssh naturapeute "cd ~/prod && \
	git reset --hard FETCH_HEAD && \
	git pull && \
	sudo ln -s terrapeute.service /etc/systemd/system/ ; \
	sudo systemctl daemon-reload && \
	npm install && \
	sudo systemctl restart terrapeute"

remote-import-airtable:
	ssh naturapeute "cd ~/prod && npm run import-airtable"

log:
	ssh naturapeute "systemctl status terrapeute -n 50"
