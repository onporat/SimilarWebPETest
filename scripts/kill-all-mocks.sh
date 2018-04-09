#!/bin/bash

for PORT in 3001 3002 3003; do
  lsof -nP -i tcp:${PORT} | awk '/'${PORT}'/ {print $2}' | xargs kill
done

