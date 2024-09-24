# Start a new tmux session named 'mysession'
tmux new-session -d -s mysession

# Run the front-end command in the first pane
tmux send-keys -t mysession 'cd nb-front-end && npm run start' C-m

# Split the window horizontally
tmux split-window -h

# Run the back-end command in the second pane
tmux send-keys 'cd nb-back-end && go run main.go' C-m

# Attach to the tmux session
tmux attach-session -t mysession