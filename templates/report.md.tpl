{# Context Type: TestNgReportTemplate -#}

<span title="Succeeded">&#x2714;&#xFE0F;</span> {{ event.report._tests.succeeded }} &bull; <span title="Skipped">&#x23ed;</span> {{ event.report._tests.skipped }} &bull; <span title="Failed">&#x274C;</span> {{ event.report._tests.failed }}

{% if annotations.length > 0 %}
## Failed tests

| Test | Description |
|:---|:---|
{%  for annotation in annotations -%}
| {{ annotation.title }} | {{ annotation.detail }} |
{%  endfor %}
{% endif %}
