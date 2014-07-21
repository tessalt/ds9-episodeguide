/** @jsx React.DOM */
var Seasons = React.createClass({displayName: 'Seasons',
  getInitialState: function() {
    return {data: []};
  },
  loadSeasonsFromServer: function() {
    var localEps = localStorage.getItem('episodes');
    if (!localEps) {
      $.ajax({
        url: this.props.url,
        success: function(data) {
          localStorage.setItem('episodes', JSON.stringify(data));
          this.setState({data: data});
        }.bind(this)
      });
    } else {
      this.setState({data: JSON.parse(localEps)});
    }
  },
  componentWillMount: function() {
    this.loadSeasonsFromServer();
  },
  render: function() {
    return (
      React.DOM.div({className: "seasonList"}, 
        SeasonList({picks: this.state.picks, seasons: this.state.data})
      )
    )
  }
});

var SeasonList = React.createClass({displayName: 'SeasonList',
  getInitialState: function() {
    return {seasons: []}
  },
  loadPicks: function(cb){
    $.ajax({
      url: 'data/picks.json',
      success: function(data) {
        cb(data);
      }.bind(this),
    });
  },
  componentWillMount: function() {
    this.loadPicks(function(picks){
      var seasons = [];
      $.each(this.props.seasons, function(index, season){
        var seasonPicks = picks[index];
        var seasonObj = {
          open: season.open,
          episodes: season.episodes,
          picks: picks[index]
        }
        seasons.push(seasonObj);
      });
      this.setState({seasons: seasons})
    }.bind(this));
  },
  render: function() {
    var seasonNodes = this.state.seasons.map(function (season, index) {
      return (
        Season({key: index, data: season})
      )
    });
    return React.DOM.div(null, seasonNodes);
  }
});

var Season = React.createClass({displayName: 'Season',
  getInitialState: function() {
    return {
      filteredEps: [],
      display: this.props.data.open
    }
  },
  componentWillMount: function() {
    var episodes = this.props.data.episodes;
    var picked = this.props.data.picks.map(function(pick, index){
      return episodes[pick - 1];
    }.bind(this));
    this.setState({filteredEps: picked});
  },
  toggleDisplay: function() {
    var localEps = JSON.parse(localStorage.getItem('episodes'));
    localEps[this.props.key].open = !this.state.display;
    localStorage.setItem('episodes', JSON.stringify(localEps));
    var el = this.refs.seasonUl.getDOMNode();
    $(el).slideToggle('medium', function(){
      this.setState({display: !this.state.display});
    }.bind(this));
  },
  render: function() {
    var key = this.props.key;
    var epNodes = this.state.filteredEps.map(function (ep, index){
      return (
        Episode({key: index, data: ep, seasonNo: key})
      )
    });
    var displayClass = this.state.display ? 'open' : 'closed';
    var iconClass = this.state.display ? 'minus' : 'plus';
    return (
      React.DOM.div({className: "season"}, 
        React.DOM.h2({onClick: this.toggleDisplay}, 
          "Season ", this.props.key + 1, 
          React.DOM.span({className: "glyphicon glyphicon-" + iconClass})
        ), 
        React.DOM.ul({ref: "seasonUl", className: "episodes " + displayClass}, epNodes)
      )
    )
  }
});

var Episode = React.createClass({displayName: 'Episode',
  getInitialState: function() {
    return {
      episode: this.props.data,
      showDesc: false
    }
  },
  toggleSave: function() {
    var localEps = JSON.parse(localStorage.getItem('episodes'));
    var watchedState = this.state.episode.watched === 'true' ? 'false' : 'true';
    localEps[this.props.seasonNo].episodes[this.state.episode.episode -1].watched = watchedState;
    localStorage.setItem('episodes', JSON.stringify(localEps));
    var ep = this.state.episode;
    ep.watched = watchedState;
    this.setState({episode: ep});
  },
  showDesc: function() {
    this.setState({showDesc: !this.state.showDesc});
  },
  render: function() {
    var displayClass = this.state.showDesc ? 'open' : 'closed';
    return (
      React.DOM.li({className: 'episode watched-' + this.state.episode.watched, key: this.props.key}, 
        React.DOM.div({className: "media"}, 
          React.DOM.div({className: "pull-left"}, 
            React.DOM.div({className: "watched", onClick: this.toggleSave}, 
              WatchedIndicator({watched: this.state.episode.watched})
            )
          ), 
          React.DOM.div({className: "media-body", onClick: this.showDesc}, 
            React.DOM.div({className: "media-heading"}, 
              React.DOM.small(null, "Episode ", this.state.episode.episode), 
              React.DOM.h3(null, this.state.episode.title.text)
            ), 
            Rating({val: this.state.episode.rating})
          ), 
          Description({
            display: displayClass, 
            notes: this.state.episode.notes, 
            content: this.state.episode.description, 
            link: this.state.episode.title.href})
        )
      )
    )
  }
});

var Description = React.createClass({displayName: 'Description',
  render: function() {
    return (
      React.DOM.div({className: 'description ' + this.props.display}, 
        React.DOM.p(null, this.props.content), 
        React.DOM.p(null, React.DOM.strong(null, this.props.notes ? 'Notes: ' : ''), this.props.notes), 
        React.DOM.p(null, React.DOM.a({target: "_blank", href: this.props.link}, "View full description"))
      )
    )
  }
});

var WatchedIndicator = React.createClass({displayName: 'WatchedIndicator',
  render: function() {
    var iconClass = this.props.watched === 'true' ? 'ok' : 'unchecked';
    return (
      React.DOM.span({className: 'glyphicon glyphicon-' + iconClass})
    )
  }
});

var Rating = React.createClass({displayName: 'Rating',
  render: function() {
    var rating = parseFloat(this.props.val);
    var ratingClass = rating >= 8 ? 'high' : 'med';
    return (
      React.DOM.span({className: 'rating rating-' + ratingClass}, this.props.val)
    )
  }
});

React.renderComponent(
  Seasons({url: "data/episodes.json"}),
  document.getElementById('container')
);
