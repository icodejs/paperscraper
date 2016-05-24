paperscraper
============

### Rewrite of jQuery.mediaBackgrounds and Node.js paperscraper-rest-api repos

Scrape and save desktop wallpapers - [http://paperscraper.jit.su](http://paperscraper.jit.su)

An experimental JavaScript web app that pull background images from a Google images API or crapes wallpaper sites via Node.js (currently broken) and presents the images in a sideshow format.

This is a work in progress and is currently undergoing a major overhaul, so 'Star' this Github repository if you'd like to receive notifications on future updates.

## General Usage (Shortcut keys)

Spacebar is always used to load new images, but the other shortcuts keys are optional and you can use the buttons provided.

* Spacebar: Load
* F: Favorites
* S: Save
* T: Tweet
* E: Email
* H: Help

## Basic Setup

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="js/libs/jquery/jquery.js"><\/script>')</script>
<script src="js/libs/jquery/jquery.easing.1.3.js"></script>
<script src="js/libs/store/store.min.js"></script>
<script src="js/libs/ps/PS.common.js"></script>
<script src="js/libs/ps/PS.data.js"></script>
<script src="js/libs/ps/PS.utils.js"></script>
<script src="js/libs/ps/PS.setup.js"></script>
<script src="js/libs/ps/PS.interaction.js"></script>
<script src="js/libs/ps/PS.ui.js"></script>
<script src="js/libs/ps/PS.events.js"></script>
<script src="js/libs/ps/PS.error.js"></script>
<script src="js/libs/ps/PS.app.js"></script>
<script>
  $(function () {
    MB.app.init();
  });
</script>
```

## Demo Screenshot

<img src="https://raw.githubusercontent.com/icodejs/paperscraper/master/client/img/screenshot.png"/>
