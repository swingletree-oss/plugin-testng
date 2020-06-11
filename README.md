# Swingletree TestNG Plugin

## Features

The Swingletree TestNG Plugin offers following functionalities:

* Attaches TestNG information to GitHub Pull Requests and commits by evaluating the TestNG report.

Processed data is persisted to ElasticSearch (if enabled) and can be processed to reports using Kibana or Grafana.

## Sending a scan report to Swingletree

A Gate webhook is published when the TestNg Plugin is enabled.
It accepts a TestNG report in XML format as a payload and needs some additional query parameters to link the report to a GitHub repository:

```yaml
gate:
  plugins:
    - id: testng
      base: # enter base url of plugin-testng instance
```

Gate publishes an endpoint which is connected to the plugin. You will need to attach information about the target repository using the provided methods of Gate (for example HTTP Headers or query parameters):

```
POST /report/testng?org=[GitHub Organization]&repo=[Repository name]&sha=[Commit SHA]&branch=[branch]
```

Swingletree will process the report and send a Check Run Status with the context `test/testng` to the given GitHub coordinates.
