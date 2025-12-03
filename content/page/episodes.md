---
layout: base.njk 
title: Episodes
description: Domination Chronicles Podcast Episodes
pagination:
  data: collections.episodes
  size: 8
  reverse: true
testdata:
  - item1
  - item2
  - item3
  - item4
permalink: /episodes/{% if pagination.pageNumber > 0 %}{{ pagination.pageNumber + 1
  }}/{% endif %}index.html
---
<div class="container py-5 mt-5">
<header class="text-center mb-5">
<h1 class="display-4">{{ title }}</h1>
<p class="lead text-secondary">{{description}}</p>
</header>
<section id="episode-list" class="row g-4">
    
    {% for e in pagination.items %}<div class="col-lg-4 col-md-6 p-1">
                    <div class="card bg-dark-secondary h-100 border-0 shadow-sm">
                        {% if e.data.image %}<img src="{{e.data.image}}" data-src="{{e.data.image}}" 
                        class="card-img-top lazy-load-image"
                        width="100%" height="100%" alt="{{ e.data.title | escape }}" loading="lazy"/>{% endif %}
                        <div class="card-body d-flex flex-column">
                            <h3 class="card-title text-white">{{e.data.title}}</h3>
                            <p class="card-text text-secondary small">Duration: {{e.data.duration}}</p>
                            <a href="{{e.url}}" class="btn btn-outline-primary mt-auto stretched-link">
                                {{widget.episode.button_episodes}}<i class="fa-solid fa-circle-play ms-2"></i>
                            </a>
                        </div>
                    </div>
                </div>{% endfor %}

<div class="row col-md-12 mt-5">
<div class="col-md-6 p-3">
{% if pagination.href.previous %}<a class="btn btn-lg btn-primary text-white col-6" href="{{ pagination.href.previous }}">Prev </a>{% endif %}
</div>
<div class="col-md-6 text-end p-3">
{% if pagination.href.next %}<a class="btn btn-lg btn-primary text-white col-6" href="{{ pagination.href.next }}">Next </a>{% endif %}
</div>
</div>
</section>
</div>