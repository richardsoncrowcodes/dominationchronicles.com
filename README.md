# dominationchronicles.com
[![Deploy Eleventy to XMIT](https://github.com/adamdjbrett/dominationchronicles.com/actions/workflows/xmit-deploy.yml/badge.svg)](https://github.com/adamdjbrett/dominationchronicles.com/actions/workflows/xmit-deploy.yml)

[![xmit logo](/xmit.co.png)](https://xmit.co)
  
Hosted on [xmit.co](https://xmit.co)

A podcast website with 11ty developed by [Adam DJ Brett](https://github.com/adamdjbrett)

## Create Citations
```Run npm run citation```

## HELP & PROJECT

Need Help or have project ?? Contact Me.
+ https://adamdjbrett.com
+ info@adamdjbrett.com

### TECH STACK
+ The Great Bootstrap
+ The Fast 11ty JAMSTACK
+ Youtube Lite
+ Auto SEO injection
+ Search Page

### How to

+ Setup Your SEO Site on `_data/metadata.yaml`
+ Update Navbar on `_data/navbar.yaml`
+ Update Widget on `_data/widget.yaml`
+ Update Sidebar on `_data/sidebar.yaml` (You can show or hide the sidebar widget)
+ Update footer on `_data/footer.yaml`
+ Update Static Page on `content/page/*.md`
+ Update Host Profile Page on `content/host/*.md`
+ Update Podcast Epsiode on `content/episodes/*.md`


### Workflow
Domination chronicles is
1. creating the podcast file by putting together the intro.wav, outro.wav and whatever content
2. youtube caption
3. social media caption
5. google metadescription
6. posting writing show notes
    1. show notes require
        1. a pdf of the transcript uploaded and linked
        2. content of show notes
        2. embeded audio player
        3. embeded youtube
        4. citation block
        
### CHANGELOG

01 Dec 2025
+ Add cover image if not use videoId
+ Add Redcricle Simple Iframe Embed
+ Add Redcricle Embed

F
+ Improve for lighthouse
+ Fontawesome optimazation
+ Update contrast
+ Remove heavy font load
+ Implement Picture Source Lazy Load
+ Implement frequency high

### Timestamp Support

Optional you can use timestamp.

Implementation on episodes/*.md
```
timestamps:
  - time: "00:00"
    note: Welcome and Opening.
  - time: "05:20"
    note: How to use the project
  - time: "15:45"
    note: SEO Startegies
  - time: "28:00"
    note: Closing Podcast Episodes
```

### HELP & PROJECT

Need Help or have project ?? Contact Me.
+ https://adamdjbrett.com
+ info@adamdjbrett.com
