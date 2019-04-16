help:
	@echo "Checkout the makefile"

deploy:
	ssh terrapeutes "cd ~/terrapeutes && git pull; pkill node; npm start &"
