<!doctype html>
<head>
    <title>E2X Authoring</title>

    {%- block head -%}

    <script>
        let base_url = "{{ base_url }}";
        let url_prefix = "{{ url_prefix }}";
        let tree_url = base_url + '/tree/' + url_prefix + '/';
        let notebook_url = base_url + '/notebooks/' + url_prefix + '/';
    </script>
    <script src="{{ base_url }}/formgrader/static/js/backbone_xsrf.js"></script>
    <script src='{{ base_url }}/e2x/authoring/static/js/api.js'></script>
    
    {%- endblock -%}    

</head>

<body>
    <h1>E²X Authoring</h1>
</body>