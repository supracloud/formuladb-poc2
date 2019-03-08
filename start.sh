#!/bin/bash

tmux new-session -d -s febe 'bash'
tmux rename-window 'Plain'
tmux send-keys -t  0  'cd be && npm run serve' 'C-m'
tmux select-window -t febe:0
tmux split-window -h 'cd fe && npm start'

tmux -2 attach-session -t febe
