# Sources Scraping Server

This project is based on a service that extracts the resources of the link of a web page, sending the result by email with a PDF report with the size and record of the resources obtained.

The service also implements a job queue along with a dashboard where it is possible to monitor the status of each queue. Apart from being monitored the state of the service with Grafana through Prometheus.

## Getting Started

Just run the following command:

```
docker-compose up --build
```

The app will be available on port 5000. You can make an HTTP POST request under the **/sendFile** path using the following JSON example to get the resources of a page:

```
{
   "linkFile":"https://github.com/AlejandroGonzalR",
   "email":"your.email@example.com"
}
```

The dashboard with the records and status of the job queues is available in the same port under the [/queues](http://localhost:5000/queues) route.

In addition to this, Prometheus will be available at port [9090](http://localhost:9090) and Grafana at port [3000](http://localhost:3000/).

## Built With

* [Node.js 12.16.1 LTS](https://maven.apache.org/) - Runtime environment
* See also the used [packages](https://github.com/AlejandroGonzalR/berkeley-algorithm/blob/master/package.json)

## Authors

* **Alejandro González Rodríguez** - *Initial work*

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
