---
layout: base.njk 
title: Hosts
description: Meet the Domination Chronicles Podcast Hosts
permalink: /host/index.html
---
<div class="container py-5 mt-5">
<header class="text-center mb-5">
<h1 class="display-4">{{ title }}</h1>
<p class="lead text-secondary">{{description}}</p>
</header>
<section id="host-list" class="row g-4">
    {% for j in widget.host.list %}
        {% if j.image %}
            <div class="col-12">
                <div class="row bg-dark-secondary rounded shadow-sm p-3 mb-3">
                    <div class="col-md-4 text-center p-3 p-md-5">
                        <a href="{{j.page}}"><img src="{{j.image}}" data-src="{{j.image}}" width="60%" height="60%" 
                        class="img-fluid rounded-circle about-img lazy-load-image" alt="{{j.name}}" loading="lazy"/></a>
                    </div>
                    <div class="col-md-7 p-3 p-md-5">
                        <h3><a href="{{j.page}}">{{j.name}}</a></h3>
                        <p class="lead text-white">{{j.about}}</p>
                        <p>{{j.text | md | safe }}</p>
                        <div class="mt-4 col-12">
                            {% for s in j.social %}{% if s.title %}
                                <a href="{{s.url}}" class="btn btn-link text-light me-3" title="{{s.title}}" 
                                aria-label="{{s.title}}"><i class="{{s.icon}}"></i></a>
                            {% endif %}{% endfor %}
                        </div>
                    </div>
                </div>
            </div>             
        {% else %}
            <div class="col-12">
                <div class="row bg-dark-secondary rounded shadow-sm p-3 mb-3">
                    <div class="col-md-12 p-3 p-md-5">
                        <h3><a href="{{j.page}}">{{j.name}}</a></h3>
                        <p class="lead text-white">{{j.about}}</p>
                        <p>{{j.text | md | safe }}</p>
                        <div class="mt-4 col-12">
                            {% for s in j.social %}{% if s.title %}
                                <a href="{{s.url}}" class="btn btn-link text-light me-3" title="{{s.title}}" 
                                aria-label="{{s.title}}"><i class="{{s.icon}}"></i></a>
                            {% endif %}{% endfor %}
                        </div>
                    </div>
                </div>
            </div>
        {% endif %}
    {% endfor %}
</section>
</div>
