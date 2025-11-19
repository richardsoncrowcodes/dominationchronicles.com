---
layout: episodes-list.njk 
title: Episodes
description: Domination Chronicles Podcast Episodes
pagination:
  data: collections.episodes
  size: 1
  #reverse: true
permalink: /episodes/{% if pagination.pageNumber > 0 %}{{ pagination.pageNumber + 1
  }}/{% endif %}index.html
---
<div class="container py-5 mt-5">
<header class="text-center mb-5">
<h1 class="display-4">{{ title }}</h1>
<p class="lead text-secondary">{{description}}</p>
</header>
<section id="episode-list" class="row g-4">
    {% set sortedEpisodes = collections.episodes | sortEpisodesByPublishDate %}
    {% for e in sortedEpisodes  %}<div class="col-lg-4 col-md-6 p-1">
                    <div class="card bg-dark-secondary h-100 border-0 shadow-sm">
                        {% if e.data.image %}<img src="{{e.data.image}}" data-src="{{e.data.image}}" 
                        class="card-img-top lazy-load-image"
                        width="100%" height="100%" alt="{{ e.data.title | escape }}" loading="lazy"/>{% endif %}
                        <div class="card-body d-flex flex-column">
                            <h3 class="card-title text-white">{{e.data.title}}</h3>
                            <p class="card-text text-secondary small">Duration: {{e.data.duration}}</p>
                            <a href="{{e.url}}" class="btn btn-outline-primary mt-auto stretched-link">
                                {{widget.episode.button_episodes}}<i class="fas fa-circle-play ms-2"></i>
                            </a>
                        </div>
                    </div>
                </div>{% endfor %}
    {% if podcast.length > 0 %}
        {% set sortedPodcast = podcast | sortPodcastByPublishDate %}
        {% for episode in sortedPodcast %}
            <div class="col-md-6 col-lg-4 d-flex">
                <div class="card bg-dark-secondary h-100 w-100 border-0 shadow-lg transition-transform hover:scale-105">
                    <a href="/episodes/{{ episode.title | slugify | lower }}/" class="text-decoration-none text-white">
                        <img class="card-img-top lazy-load-image"
                             src="https://placehold.co/400x400/2c2c2e/f5f5f7?text=Loading"
                             data-src="{{ episode.image }}" 
                             alt="Cover Episode: {{ episode.title | escape }}"
                             loading="lazy"
                        ></a>
                        <div class="card-body text-white">
                            <h2 class="h5 mt-2 mb-2 text-white">{{ episode.title }}</h2>
                            <p class="card-text small text-secondary">
                               {{ episode.publishDate }} &vert; {{ episode.description | striptags | truncate(150) }}
                            </p>
                              <a href="/episodes/{{ episode.title | slugify | lower }}/" class="btn btn-outline-primary mt-auto stretched-link col-12">
                                {{widget.episode.button_episodes}}<i class="fas fa-circle-play ms-2"></i>
                            </a>
                        </div>
                </div>
            </div>
        {% endfor %}
    {% else %}
        <div class="col-12 text-center">
            <p class="text-secondary">Not Found Podcast.</p>
        </div>
    {% endif %}
</section>
</div>