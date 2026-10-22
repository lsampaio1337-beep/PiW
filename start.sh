#!/bin/bash
npx serve . -l 3000 &
echo $! > serve.pid
