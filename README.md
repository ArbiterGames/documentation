Arbiter Documentation
========

Source for Arbiter Developer documentation. The style and formatting of these docs are from [Slate](https://github.com/tripit/slate/).

This repo publishes to: [http://arbitergames.github.io/documentation/](http://arbitergames.github.io/documentation/) 

To Edit these docs
------------

### Prerequisites

 - **Ruby, version 1.9.3 or newer**
 - **Bundler** — If Ruby is already installed, but the `bundle` command doesn't work, just run `gem install bundler` in a terminal.

### Clone and run server

1. `mkdir arbiter-documentation`
2. `cd arbiter-documentation`
3.  `git clone git@github.com:ArbiterGames/documentation.git .`
4. `bundle install`
5. `bundle exec middleman server`

You can now see the docs at <http://localhost:4567>.

### Publishing

Once your edits are committed and pushed to master, publish to <http://arbitergames.github.io/documentation/> using 

`rake publish`