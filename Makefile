help:
	@echo "Checkout the makefile"

deploy:
	ssh terrapeute "cd ~/prod && \
	git reset --hard FETCH_HEAD && \
	git pull && \
	sudo ln -s terrapeute.service /etc/systemd/system/ ; \
	sudo systemctl daemon-reload && \
	npm install && \
	sudo systemctl restart terrapeute"

log:
	ssh terrapeute "systemctl status terrapeute -n 50"
