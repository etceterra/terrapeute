help:
	@echo "Checkout the makefile"

deploy:
	ssh terrapeutes "cd ~/terrapeutes && \
	git pull && \
	sudo cp terrapeutes.service /etc/systemd/system/ && \
	sudo systemctl daemon-reload && \
	npm install && \
	sudo systemctl restart terrapeutes"

log:
	ssh terrapeutes "systemctl status terrapeutes -n 50"
