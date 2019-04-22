help:
	@echo "Checkout the makefile"

deploy:
	ssh terrapeutes "cd ~/terrapeutes && git pull && sudo cp terrapeutes.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl restart terrapeutes"
