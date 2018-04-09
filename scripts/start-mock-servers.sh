#!/bin/bash

npm run kill:mocks

npm run start:mock 3001 100 &
npm run start:mock 3002 500 &
npm run start:mock 3003 1000
