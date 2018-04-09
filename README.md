Production Engineering - Home Assignment

# Design overview
Developed in Node.js using express, axios and Promises.
Mirror the endpoints of the upstream service.
For incoming `GET` request issue `GET` a request to	an upstream server, cycle over the servers in round-robin fashion.
For incoming `POST` requests, issue `POST` requests to all the upstream servers, use `Promise.race` to return the first one that returned. If the request to upstream server failed keep retrying until
successful, using an exponential backoff interval.

# Install
```
git clone https://github.com/onporat/SimilarWebPETest
cd SimilarWebPETest
npm install
```
## To start the Load Balancer
```
npm start
```
# Testing
## Start mock servers
Open a new terminal and run the follwing.
```
npm run start:mocks
```
This command will spawn three mock servers listening on ports 3001, 3002 and 3003,
Each server is initialized with different delay time 100ms, 500ms and 1000ms.
## Calling the load balancer
In another terminal issue `curl` commands to the load balancer
### Testing /login (get)
run several times
```
curl http://localhost:8080/login
```
The mock server returns it's port number in the response, so each for each call one should get a different port in a round-robin fashion.
#### Expected output
```
$ curl localhost:8080/login
{"login":"OK","port":"3001"}

$ curl localhost:8080/login
{"login":"OK","port":"3002"}

$ curl localhost:8080/login
{"login":"OK","port":"3003"}

$ curl localhost:8080/login
{"login":"OK","port":"3001"}
```

### Testing /changePassword (post)
run several times
```
curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"xyz"}' http://localhost:8080/changePassword
```
Server 3001 should always replay because it is the fastest (shortest delay)
#### Expected output 
```
{"changePassword":"OK","port":"3001"}
```
In the mock servers terminal see that all servers get the `/changePassword` post request.

### Testing /changePassword (post) when one mock server is down
Stop (`kill`) mock server with port 3001. PIDs are listed in mock servers terminal.

run several times
```
curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"xyz"}' http://localhost:8080/changePassword
```
Server 3002 should always replay because it is the fastest (shortest delay) once server 3001 is stopped.

Start server 3001 again
```
npm run start:mock 3001 100
```
Switch to the to the mock servers terminal window and see that missed `/changePassword` post requests to server 3001 are send after a while.
Repeat the first test of `/changePassword` and see that server 3001 response first again.

## Metrics
The `/metrics` endpoint returns status of counters collected during operation.
```
curl localhost:8080/metrics
{"totalGetRequests":11,"totalPostRequests":5,"totalErrors":1}
```
