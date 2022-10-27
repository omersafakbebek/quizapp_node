#!/bin/bash
rsync --rsync-path="sudo rsync" -r -avh --exclude={"deploy.sh","index.html","logo.png",".git"} /home/${USER}/quizapp_node ubuntu@ec2-54-164-128-198.compute-1.amazonaws.com:/opt/projects/ --delete
ssh ubuntu@ec2-54-164-128-198.compute-1.amazonaws.com sudo systemctl restart quizapp_node.service

