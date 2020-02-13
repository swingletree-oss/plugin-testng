{# Context Type: TestNgReportTemplate -#}

<span title="Succeeded">&#x2714;&#xFE0F;</span> {{ event.report._tests.succeeded }} &bull; <span title="Skipped">&#x23ed;</span> {{ event.report._tests.skipped }} &bull; <span title="Failed">&#x274C;</span> {{ event.report._tests.failed }}

{%- for suite in event['testng-results'].suite %}

### Suite {{ suite.$.name }}

| | Group | Class | Test | Description |
|---|:---|:---|:---|:---|
{%-  for test in suite.test %}
{%-    for testClass in test.class %}
{%-      for testMethod in testClass['test-method'] %}
| {{ testMethod.$.status }} | {{ testClass.$.name }} | {{ testMethod.$.signature }} | {{ testMethod.$.description }} |
{%-      endfor %}
{%-    endfor %}
{%-  endfor %}
{% endfor %}
